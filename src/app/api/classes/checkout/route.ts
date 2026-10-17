import { NextResponse } from "next/server";
import { z } from "zod";
import { track } from "@vercel/analytics/server";
import { squareClient } from "@/lib/square";
import { getClass, hasSquare } from "@/lib/classes-square";
import { isSoldOut, parsePicks, shortDay, first } from "@/lib/classes";

/*
 * Books seats in a class: re-reads the class from Square (price, pieces and
 * seats left are never taken from the browser), holds the seats by moving
 * them from in stock to sold — Square refuses if they're no longer there —
 * and hands back a Square payment link. The shop's webhook puts the seats
 * back if the order is cancelled, from the same metadata the shop uses.
 */

const requestSchema = z.object({
  id: z.string().min(1).max(64),
  /* one entry per seat: the piece's modifier id, or null when it's set */
  pieces: z.array(z.string().max(64).nullable()).min(1).max(20),
});

const fail = (reason: string) =>
  track("class_checkout_failed", { reason }).catch(() => {});

export async function POST(req: Request) {
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  if (!hasSquare()) {
    // the sample classes can't be bought
    return NextResponse.json({ preview: true }, { status: 409 });
  }

  const e = await getClass(parsed.data.id);
  if (!e || !e.variationId) {
    await fail("not_found");
    return NextResponse.json({ error: "class not found" }, { status: 404 });
  }
  if (isSoldOut(e)) {
    await fail("sold_out");
    return NextResponse.json({ error: "sold out" }, { status: 409 });
  }
  const picks = parsePicks(e, parsed.data.pieces);
  if (!picks) {
    await fail("bad_picks");
    return NextResponse.json(
      { error: "those seats or pieces aren't available", left: e.left },
      { status: 409 },
    );
  }

  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) {
    await fail("not_configured");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }
  const seats = picks.length;

  try {
    await squareClient.inventory.batchCreateChanges({
      idempotencyKey: crypto.randomUUID(),
      changes: [
        {
          type: "ADJUSTMENT",
          adjustment: {
            catalogObjectId: e.variationId,
            locationId,
            fromState: "IN_STOCK",
            toState: "SOLD",
            quantity: String(seats),
            occurredAt: new Date().toISOString(),
          },
        },
      ],
    });
  } catch (err) {
    console.error("[classes] couldn't hold seats:", err);
    await fail("hold_error");
    return NextResponse.json(
      { error: "those seats just went — please try again" },
      { status: 409 },
    );
  }

  // seats making the same piece share a line; square prices each line from
  // the catalog, base ticket plus the piece's modifier
  const byPiece = new Map<string | null, number>();
  for (const p of picks) byPiece.set(p, (byPiece.get(p) ?? 0) + 1);
  const when = e.sessions.map((s) => shortDay(s.date)).join(" & ");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const { paymentLink } = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId,
        referenceId: `class ${shortDay(first(e).date)}`.slice(0, 40),
        lineItems: [...byPiece].map(([piece, quantity]) => ({
          catalogObjectId: e.variationId,
          quantity: String(quantity),
          modifiers: piece ? [{ catalogObjectId: piece }] : undefined,
          note: when,
        })),
        // read by the square webhook to give the seats back on cancel
        metadata: {
          variationIds: e.variationId,
          variationQuantities: String(seats),
        },
      },
      checkoutOptions: {
        redirectUrl: `${siteUrl}/classes/${e.id}/booked`,
        askForShippingAddress: false,
      },
    });
    if (!paymentLink?.url) throw new Error("no checkout url returned");
    await track("class_checkout_link_created", { seats }).catch(() => {});
    return NextResponse.json({ url: paymentLink.url });
  } catch (err) {
    console.error("[classes] square checkout error:", err);
    await fail("link_error");
    // give the held seats back
    await squareClient.inventory
      .batchCreateChanges({
        idempotencyKey: crypto.randomUUID(),
        changes: [
          {
            type: "ADJUSTMENT",
            adjustment: {
              catalogObjectId: e.variationId,
              locationId,
              // square won't move SOLD back (or via RETURNED_BY_CUSTOMER);
              // NONE → IN_STOCK is the one way to put a held unit back
              fromState: "NONE",
              toState: "IN_STOCK",
              quantity: String(seats),
              occurredAt: new Date().toISOString(),
            },
          },
        ],
      })
      .catch((e2) => console.error("[classes] couldn't release seats:", e2));
    return NextResponse.json({ error: "checkout failed" }, { status: 502 });
  }
}

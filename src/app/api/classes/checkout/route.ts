import { NextResponse } from "next/server";
import type { Currency } from "square";
import { z } from "zod";
import { track } from "@vercel/analytics/server";
import { squareClient } from "@/lib/square";
import { SOFT_HOLD } from "@/lib/holds";
import { getClass, hasSquare } from "@/lib/classes-square";
import { isSoldOut, parsePicks, shortDay, first } from "@/lib/classes";
import {
  drinkLabel,
  drinkUpgrades,
  menuFor,
  parseDrinks,
  type DrinkMenu,
  type DrinkPick,
} from "@/lib/drinks";

/*
 * Books seats in a class: re-reads the class from Square (price, pieces and
 * seats left are never taken from the browser — seats in other unpaid
 * checkouts are already counted out) and hands back a Square payment link.
 * Stock isn't touched here: the unpaid order holds the seats (a soft hold,
 * see lib/holds) and Square marks them sold itself once it's paid.
 */

const requestSchema = z.object({
  id: z.string().min(1).max(64),
  /* one entry per seat: the piece's modifier id, or null when it's set */
  pieces: z.array(z.string().max(64).nullable()).min(1).max(20),
  /* one drink per seat, as in the link — collab classes with a menu */
  drinks: z.string().max(2000).optional(),
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

  // a class with a drink menu needs one drink per seat, every choice on it
  const menu = menuFor(e);
  const drinks = menu
    ? parseDrinks(menu, parsed.data.drinks, picks.length)
    : null;
  if (menu && !drinks) {
    await fail("bad_drinks");
    return NextResponse.json(
      { error: "pick a drink for every seat" },
      { status: 400 },
    );
  }

  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) {
    await fail("not_configured");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }
  const seats = picks.length;

  // seats making the same piece share a line; square prices each line from
  // the catalog, base ticket plus the piece's modifier
  const byPiece = new Map<string | null, number>();
  for (const p of picks) byPiece.set(p, (byPiece.get(p) ?? 0) + 1);
  const when = e.sessions.map((s) => shortDay(s.date)).join(" & ");

  // with drinks, each seat gets its own line so its drink reads on the
  // order; the milk and syrup upgrades follow as lines of their own
  const seatLines =
    menu && drinks
      ? picks.map((piece, i) => ({
          catalogObjectId: e.variationId,
          quantity: "1",
          modifiers: piece ? [{ catalogObjectId: piece }] : undefined,
          note: `${when} · ${drinkLabel(menu, drinks[i])}`.slice(0, 500),
        }))
      : [...byPiece].map(([piece, quantity]) => ({
          catalogObjectId: e.variationId,
          quantity: String(quantity),
          modifiers: piece ? [{ catalogObjectId: piece }] : undefined,
          note: when,
        }));
  const upgradeLines = menu && drinks ? upgradeLinesFor(menu, drinks) : [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const { paymentLink } = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId,
        referenceId: `class ${shortDay(first(e).date)}`.slice(0, 40),
        lineItems: [...seatLines, ...upgradeLines],
        // the unpaid order is the hold (see lib/holds): counted against
        // seats left for HOLD_MINUTES; square sells them itself once paid
        metadata: {
          ...SOFT_HOLD,
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
    return NextResponse.json({ error: "checkout failed" }, { status: 502 });
  }
}

/* "oat milk · 333 matcha" × 2 at $0.50 — the drink upgrades, a line each */
function upgradeLinesFor(menu: DrinkMenu, drinks: DrinkPick[]) {
  const lines = new Map<string, { name: string; cents: number; n: number }>();
  for (const d of drinks) {
    for (const u of drinkUpgrades(menu, d)) {
      const line = lines.get(u.id) ?? {
        name: `${u.name} · ${menu.from}`,
        cents: Math.round(u.extra * 100),
        n: 0,
      };
      line.n += 1;
      lines.set(u.id, line);
    }
  }
  return [...lines.values()].map((l) => ({
    name: l.name,
    quantity: String(l.n),
    basePriceMoney: { amount: BigInt(l.cents), currency: "USD" as Currency },
  }));
}

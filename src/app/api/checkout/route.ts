import { NextResponse } from "next/server";
import { squareClient, fetchPieceById } from "@/lib/square";
import type { Currency } from "square";
import { z } from "zod";

const USD = "USD" as Currency;

const CheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(128),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
  delivery: z.enum(["ship", "pickup"]),
  note: z.string().max(500).optional(),
  pickupSlot: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  const raw = await req.json();
  const parsed = CheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const { items, delivery, note, pickupSlot } = parsed.data;

  // Look up authoritative prices server-side — never trust the client
  const pieces = await Promise.all(items.map((i) => fetchPieceById(i.id)));
  if (pieces.some((p) => !p)) {
    return NextResponse.json({ error: "item not found" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const locationId = process.env.SQUARE_LOCATION_ID ?? "";

  const lineItems = pieces.map((piece, idx) => ({
    name: piece!.title,
    quantity: String(items[idx].quantity),
    basePriceMoney: {
      amount: BigInt(Math.round(piece!.price * 100)),
      currency: USD,
    },
  }));

  // Shipping computed server-side — never accept from client
  const shippingCents = delivery === "ship" ? 1200 : 0;
  if (shippingCents > 0) {
    lineItems.push({
      name: "shipping",
      quantity: "1",
      basePriceMoney: {
        amount: BigInt(shippingCents),
        currency: USD,
      },
    });
  }

  const orderNote = [
    delivery === "pickup" && pickupSlot ? `pickup: ${pickupSlot}` : "shipping",
    note ? `note: ${note.slice(0, 480)}` : "",
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 40);

  try {
    const response = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId,
        lineItems,
        referenceId: orderNote || undefined,
      },
      checkoutOptions: {
        redirectUrl: `${siteUrl}/order-confirmed`,
        askForShippingAddress: delivery === "ship",
      },
    });

    const url = response.paymentLink?.url;
    if (!url) throw new Error("no checkout url returned");

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Square checkout error:", err);
    return NextResponse.json({ error: "checkout failed" }, { status: 500 });
  }
}

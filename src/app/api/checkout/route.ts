import { NextResponse } from "next/server";
import { squareClient } from "@/lib/square";
import type { Currency } from "square";

const USD = "USD" as Currency;

interface CheckoutRequest {
  items: Array<{ name: string; price: number; quantity: number }>;
  shipping: number;
  note?: string;
  delivery: "ship" | "pickup";
  pickupSlot?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutRequest;
  const { items, shipping, note, delivery, pickupSlot } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "no items" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const locationId = process.env.SQUARE_LOCATION_ID ?? "";

  const lineItems = items.map((item) => ({
    name: item.name,
    quantity: String(item.quantity),
    basePriceMoney: {
      amount: BigInt(Math.round(item.price * 100)),
      currency: USD,
    },
  }));

  if (shipping > 0) {
    lineItems.push({
      name: "shipping",
      quantity: "1",
      basePriceMoney: {
        amount: BigInt(Math.round(shipping * 100)),
        currency: USD,
      },
    });
  }

  const orderNote = [
    delivery === "pickup" && pickupSlot ? `pickup: ${pickupSlot}` : "shipping",
    note ? `note: ${note}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

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

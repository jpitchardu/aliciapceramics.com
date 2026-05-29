import { NextResponse } from "next/server";
import { squareClient } from "@/lib/square";

interface PaymentRequest {
  sourceId: string;
  amount: number;
  note?: string;
  idempotencyKey: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as PaymentRequest;
  const { sourceId, amount, note, idempotencyKey } = body;

  if (!sourceId || !amount || !idempotencyKey) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  try {
    const response = await squareClient.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)),
        currency: "USD",
      },
      note: note ?? "alicia p. ceramics order",
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "",
    });

    return NextResponse.json({ payment: response.payment });
  } catch (err) {
    console.error("Square payment error:", err);
    return NextResponse.json({ error: "payment failed" }, { status: 500 });
  }
}

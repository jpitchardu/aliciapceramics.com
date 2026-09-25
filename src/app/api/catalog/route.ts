import { NextResponse } from "next/server";
import { fetchAllPieces } from "@/lib/square";
import { shopClosedResponse } from "@/lib/gate";

export const revalidate = 300;

export async function GET() {
  const closed = await shopClosedResponse();
  if (closed) return closed;

  const pieces = await fetchAllPieces();
  return NextResponse.json(pieces);
}

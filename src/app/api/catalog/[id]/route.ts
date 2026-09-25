import { NextResponse } from "next/server";
import { fetchPieceById } from "@/lib/square";
import { shopClosedResponse } from "@/lib/gate";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const closed = await shopClosedResponse();
  if (closed) return closed;

  const { id } = await params;
  const piece = await fetchPieceById(id);
  if (!piece) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(piece);
}

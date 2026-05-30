import { NextResponse } from "next/server";
import { fetchPieceById } from "@/lib/square";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const piece = await fetchPieceById(id);
  if (!piece) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(piece);
}

import { NextResponse } from "next/server";
import { fetchAllPieces } from "@/lib/square";

export const revalidate = 300;

export async function GET() {
  const pieces = await fetchAllPieces();
  return NextResponse.json(pieces);
}

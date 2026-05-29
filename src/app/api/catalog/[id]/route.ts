import { NextResponse } from "next/server";
import {
  squareClient,
  mapCatalogItemToPiece,
  safeSerialize,
} from "@/lib/square";
import { PLACEHOLDER_PIECES } from "@/lib/placeholder-pieces";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!process.env.SQUARE_ACCESS_TOKEN) {
    const piece = PLACEHOLDER_PIECES.find((p) => p.id === id);
    if (!piece)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(piece);
  }

  try {
    const response = await squareClient.catalog.object.get({
      objectId: id,
      includeRelatedObjects: true,
    });
    const item = response.object;
    const relatedObjects = response.relatedObjects ?? [];

    const images = new Map<string, string>();
    for (const obj of relatedObjects) {
      if (obj.type === "IMAGE" && obj.id && obj.imageData?.url) {
        images.set(obj.id, obj.imageData.url);
      }
    }

    const piece = mapCatalogItemToPiece(item, images);
    if (!piece)
      return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json(safeSerialize(piece));
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}

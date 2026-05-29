import { NextResponse } from "next/server";
import {
  squareClient,
  mapCatalogItemToPiece,
  safeSerialize,
} from "@/lib/square";
import { CatalogObject } from "square";

export const revalidate = 300;

export async function GET() {
  try {
    const page = await squareClient.catalog.list({ types: "ITEM,IMAGE" });
    const objects: CatalogObject[] = [];
    for await (const obj of page) {
      objects.push(obj);
    }

    const images = new Map<string, string>();
    for (const obj of objects) {
      if (obj.type === "IMAGE" && obj.id && obj.imageData?.url) {
        images.set(obj.id, obj.imageData.url);
      }
    }

    const pieces = objects
      .filter((o) => o.type === "ITEM")
      .map((o) => mapCatalogItemToPiece(o, images))
      .filter(Boolean);

    return NextResponse.json(safeSerialize(pieces));
  } catch {
    return NextResponse.json([]);
  }
}

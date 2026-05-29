import { NextResponse } from "next/server";
import {
  squareClient,
  mapCatalogItemToPiece,
  safeSerialize,
} from "@/lib/square";
import { CatalogObject } from "square";

export const revalidate = 300;

const DEBUG = process.env.SQUARE_DEBUG === "true";

function log(...args: unknown[]) {
  if (DEBUG) console.log("[square:catalog]", ...args);
}

export async function GET() {
  log("fetching catalog, env:", process.env.SQUARE_ENVIRONMENT);
  log("token set:", !!process.env.SQUARE_ACCESS_TOKEN);
  log("location id:", process.env.SQUARE_LOCATION_ID);

  try {
    const page = await squareClient.catalog.list({ types: "ITEM,IMAGE" });
    const objects: CatalogObject[] = [];
    for await (const obj of page) {
      objects.push(obj);
    }
    log("raw objects fetched:", objects.length);

    const images = new Map<string, string>();
    for (const obj of objects) {
      if (obj.type === "IMAGE" && obj.id && obj.imageData?.url) {
        images.set(obj.id, obj.imageData.url);
      }
    }
    log("images found:", images.size);

    const pieces = objects
      .filter((o) => o.type === "ITEM")
      .map((o) => mapCatalogItemToPiece(o, images))
      .filter(Boolean);

    log("pieces mapped:", pieces.length);
    return NextResponse.json(safeSerialize(pieces));
  } catch (err) {
    console.error("[square:catalog] error:", err);
    return NextResponse.json([]);
  }
}

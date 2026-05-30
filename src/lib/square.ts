import { SquareClient, SquareEnvironment, CatalogObject } from "square";
import { Piece, PieceState } from "@/types/piece";

const token = process.env.SQUARE_ACCESS_TOKEN;
const environment = process.env.SQUARE_ENVIRONMENT;

if (!token) {
  throw new Error(
    "[square] SQUARE_ACCESS_TOKEN is not set. " +
      "Add it to your environment variables.",
  );
}
if (!environment || !["sandbox", "production"].includes(environment)) {
  throw new Error(
    `[square] SQUARE_ENVIRONMENT must be "sandbox" or "production", got: ${environment ?? "(unset)"}`,
  );
}

export const squareClient = new SquareClient({
  token,
  environment:
    environment === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

function bigIntReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

export function safeSerialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, bigIntReplacer));
}

function inferState(inventoryNote: string): PieceState {
  const n = inventoryNote.toLowerCase();
  if (n.includes("gone") || n.includes("taken") || n.includes("sold"))
    return "gone";
  return "here";
}

export async function fetchAllPieces(): Promise<Piece[]> {
  console.log(
    "[square:catalog] fetching catalog, env:",
    process.env.SQUARE_ENVIRONMENT,
  );
  console.log("[square:catalog] token set:", !!process.env.SQUARE_ACCESS_TOKEN);
  try {
    const page = await squareClient.catalog.list({ types: "ITEM,IMAGE" });
    const objects: CatalogObject[] = [];
    for await (const obj of page) {
      objects.push(obj);
    }
    console.log("[square:catalog] raw objects fetched:", objects.length);

    const images = new Map<string, string>();
    for (const obj of objects) {
      if (obj.type === "IMAGE" && obj.id && obj.imageData?.url) {
        images.set(obj.id, obj.imageData.url);
      }
    }
    console.log("[square:catalog] images found:", images.size);

    const pieces = objects
      .filter((o) => o.type === "ITEM")
      .map((o) => mapCatalogItemToPiece(o, images))
      .filter((p): p is Piece => p !== null);

    console.log("[square:catalog] pieces mapped:", pieces.length);
    return safeSerialize(pieces);
  } catch (err) {
    console.error("[square:catalog] error:", err);
    return [];
  }
}

export async function fetchPieceById(id: string): Promise<Piece | null> {
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
    const item = objects.find((o) => o.type === "ITEM" && o.id === id);
    if (!item) return null;
    const piece = mapCatalogItemToPiece(item, images);
    return piece ? safeSerialize(piece) : null;
  } catch (err) {
    console.error("[square:catalog] error fetching piece:", id, err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCatalogItemToPiece(
  item: any,
  images: Map<string, string>,
): Piece | null {
  if (!item || item.type !== "ITEM") return null;
  const data = item.itemData;
  if (!data) return null;

  const variation = data.variations?.[0];
  const priceAmount = variation?.itemVariationData?.priceMoney?.amount;
  const price = priceAmount ? Number(priceAmount) / 100 : 0;

  const customAttrs = data.customAttributeValues ?? {};
  const glaze = customAttrs["glaze"]?.stringValue ?? "";
  const dim = customAttrs["dim"]?.stringValue ?? "";
  const pieceNum =
    customAttrs["piece_number"]?.stringValue ?? item.id.slice(-3);
  const inventoryNote = customAttrs["state"]?.stringValue ?? "";

  const imageId = data.imageIds?.[0];
  const src = imageId
    ? (images.get(imageId) ?? "/assets/photo-placeholder.png")
    : "/assets/photo-placeholder.png";

  return {
    id: item.id,
    n: pieceNum,
    title: data.name ?? "untitled",
    note: data.description ?? "",
    glaze,
    dim,
    price,
    state: inferState(inventoryNote),
    src,
    collection: data.categoryId ?? undefined,
  };
}

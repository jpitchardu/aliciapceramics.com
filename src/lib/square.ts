import { SquareClient, SquareEnvironment } from "square";
import { Piece, PieceState } from "@/types/piece";

export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN ?? "",
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
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
  if (n.includes("held")) return "held";
  if (n.includes("gone") || n.includes("taken")) return "gone";
  return "here";
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

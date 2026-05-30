import { SquareClient, SquareEnvironment, CatalogObject } from "square";
import { Piece, PieceState } from "@/types/piece";
import { MOCK_PIECES, MOCK_CATEGORIES } from "@/lib/mockCatalog";

const USE_MOCK = process.env.SQUARE_ACCESS_TOKEN === "fake";

function createSquareClient(): SquareClient {
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

  return new SquareClient({
    token,
    environment:
      environment === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
}

let _client: SquareClient | null = null;
function getClient(): SquareClient {
  if (!_client) _client = createSquareClient();
  return _client;
}

export const squareClient = new Proxy({} as SquareClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
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
  if (USE_MOCK) return MOCK_PIECES;
  const { pieces } = await fetchCatalog();
  return pieces;
}

export type Category = { id: string; name: string };

async function fetchObjects(): Promise<CatalogObject[]> {
  const page = await squareClient.catalog.list({
    types: "ITEM,IMAGE,CATEGORY",
  });
  const objects: CatalogObject[] = [];
  for await (const obj of page) {
    objects.push(obj);
  }
  return objects;
}

export async function fetchCatalog(): Promise<{
  pieces: Piece[];
  categories: Category[];
}> {
  if (USE_MOCK) return { pieces: MOCK_PIECES, categories: MOCK_CATEGORIES };
  console.log(
    "[square:catalog] fetching catalog, env:",
    process.env.SQUARE_ENVIRONMENT,
  );
  try {
    const objects = await fetchObjects();
    console.log("[square:catalog] raw objects fetched:", objects.length);

    const images = new Map<string, string>();
    for (const obj of objects) {
      if (obj.type === "IMAGE" && obj.id && obj.imageData?.url) {
        images.set(obj.id, obj.imageData.url);
      }
    }

    const pieces = objects
      .filter((o) => o.type === "ITEM")
      .map((o) => mapCatalogItemToPiece(o, images))
      .filter((p): p is Piece => p !== null);

    const categories: Category[] = objects
      .filter((o) => o.type === "CATEGORY")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((o: any) => ({
        id: o.id as string,
        name: o.categoryData?.name as string,
      }))
      .filter((c) => c.id && c.name);

    console.log(
      "[square:catalog] pieces:",
      pieces.length,
      "categories:",
      categories.length,
    );
    return safeSerialize({ pieces, categories });
  } catch (err) {
    console.error("[square:catalog] error:", err);
    return { pieces: [], categories: [] };
  }
}

export async function fetchPieceById(id: string): Promise<Piece | null> {
  if (USE_MOCK) return MOCK_PIECES.find((p) => p.n === id || p.id === id) ?? null;
  try {
    const response = await squareClient.catalog.object.get({
      objectId: id,
      includeRelatedObjects: true,
    });
    const item = response.object;
    if (!item || item.type !== "ITEM") return null;
    const images = new Map<string, string>();
    for (const obj of response.relatedObjects ?? []) {
      if (obj.type === "IMAGE" && obj.id && obj.imageData?.url) {
        images.set(obj.id, obj.imageData.url);
      }
    }
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

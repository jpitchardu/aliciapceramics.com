import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

/*
 * fetchPieceById against a stubbed Square client. Square's "related objects"
 * on a single-item lookup carry only the reporting category — not every
 * category the item is in — so the shop check must not rely on them.
 */

const objectGet = vi.fn();
const batchGet = vi.fn();
const batchGetCounts = vi.fn();

vi.mock("square", () => ({
  SquareEnvironment: { Production: "production", Sandbox: "sandbox" },
  SquareClient: class {
    catalog = { object: { get: objectGet }, batchGet };
    inventory = { batchGetCounts };
  },
}));

const { fetchPieceById } = await import("@/lib/square");

const category = (id: string, name: string) => ({
  type: "CATEGORY",
  id,
  categoryData: { name },
});
const ONLINE = category("CAT_ONLINE", "online shop");
const MUGS = category("CAT_MUGS", "mugs");
const MARKET = category("CAT_MARKET", "market only");

const item = (categoryIds: string[]) => ({
  type: "ITEM",
  id: "ITEM1",
  itemData: {
    name: "12oz Melting Sky Dimple Cup",
    productType: "REGULAR",
    categories: categoryIds.map((id) => ({ id })),
    variations: [
      {
        id: "VAR1",
        itemVariationData: { priceMoney: { amount: BigInt(4000) } },
      },
    ],
  },
});

const env = { ...process.env };
beforeAll(() => {
  process.env.SQUARE_ACCESS_TOKEN = "test";
  process.env.SQUARE_ENVIRONMENT = "sandbox";
  process.env.SQUARE_LOCATION_ID = "LOC1";
});
afterAll(() => {
  process.env = env;
});

beforeEach(() => {
  vi.clearAllMocks();
  batchGetCounts.mockResolvedValue([
    { catalogObjectId: "VAR1", state: "IN_STOCK", quantity: "1" },
  ]);
  // the categories the item names, looked up by id
  const all = new Map([ONLINE, MUGS, MARKET].map((c) => [c.id, c]));
  batchGet.mockImplementation(
    async ({ objectIds }: { objectIds: string[] }) => ({
      objects: objectIds.map((id) => all.get(id)).filter(Boolean),
    }),
  );
});

describe("fetchPieceById", () => {
  it("finds a shop piece with no reporting category", async () => {
    // as Square answers for a piece added in the Dashboard today: no
    // categories at all among the related objects
    objectGet.mockResolvedValue({
      object: item(["CAT_MUGS", "CAT_ONLINE"]),
      relatedObjects: [],
    });
    const piece = await fetchPieceById("ITEM1");
    expect(piece?.title).toBe("12oz Melting Sky Dimple Cup");
    expect(piece?.state).toBe("here");
    expect(piece?.price).toBe(40);
  });

  it("finds a shop piece whose reporting category isn't online shop", async () => {
    objectGet.mockResolvedValue({
      object: item(["CAT_MUGS", "CAT_ONLINE"]),
      relatedObjects: [MUGS],
    });
    expect(await fetchPieceById("ITEM1")).not.toBeNull();
  });

  it("still keeps out a piece that isn't in online shop", async () => {
    objectGet.mockResolvedValue({
      object: item(["CAT_MUGS"]),
      relatedObjects: [],
    });
    expect(await fetchPieceById("ITEM1")).toBeNull();
  });

  it("still keeps out a market-only piece", async () => {
    objectGet.mockResolvedValue({
      object: item(["CAT_ONLINE", "CAT_MARKET"]),
      relatedObjects: [],
    });
    expect(await fetchPieceById("ITEM1")).toBeNull();
  });
});

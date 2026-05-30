import { SquareClient, SquareEnvironment } from "square";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const eq = l.indexOf("=");
      return [l.slice(0, eq), l.slice(eq + 1).replace(/^"|"$/g, "")];
    }),
);

const client = new SquareClient({
  token: env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Production,
});

const listed = [];
const page = await client.catalog.list({ types: "ITEM,IMAGE,CATEGORY" });
for await (const obj of page) listed.push(obj);

const itemIds = listed.filter((o) => o.type === "ITEM").map((o) => o.id).filter(Boolean);
const { objects: fullItems = [] } = await client.catalog.batchGet({ objectIds: itemIds });

const objects = [
  ...listed.filter((o) => o.type !== "ITEM"),
  ...fullItems,
];

const items = objects.filter((o) => o.type === "ITEM");
const cats = objects.filter((o) => o.type === "CATEGORY");

console.log(`\n=== ${items.length} items, ${cats.length} categories ===\n`);

function findAttr(attrs, name) {
  return Object.values(attrs ?? {}).find((a) => a.name === name)?.stringValue ?? "";
}

for (const item of items) {
  const d = item.itemData;
  const attrs = item.customAttributeValues ?? {};
  const variation = d.variations?.[0]?.itemVariationData;
  console.log(`${d.name}`);
  console.log(`  piece_number : "${findAttr(attrs, "piece_number")}"`);
  console.log(`  glaze        : "${findAttr(attrs, "glaze")}"`);
  console.log(`  dim          : "${findAttr(attrs, "dim")}"`);
  console.log(`  state        : "${findAttr(attrs, "state")}"`);
  console.log(`  track_inv    : ${variation?.trackInventory ?? false}`);
  console.log(`  images       : ${d.imageIds?.length ?? 0}`);
  console.log();
}

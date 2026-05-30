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

// 1. Get location ID
const { locations } = await client.locations.list();
const locationId = locations[0].id;
console.log(`Location: ${locations[0].name} (${locationId})\n`);

// 2. Fetch all items with full data (including custom attrs)
const listed = [];
const page = await client.catalog.list({ types: "ITEM" });
for await (const obj of page) listed.push(obj);

const { objects: items = [] } = await client.catalog.batchGet({
  objectIds: listed.map((o) => o.id).filter(Boolean),
});

console.log(`Found ${items.length} items\n`);

// 3. Enable trackInventory on every variation via batchUpsert
const variationBatches = [];
for (const item of items) {
  for (const v of item.itemData?.variations ?? []) {
    variationBatches.push({
      type: "ITEM_VARIATION",
      id: v.id,
      version: v.version,
      presentAtAllLocations: item.presentAtAllLocations ?? false,
      itemVariationData: {
        ...v.itemVariationData,
        trackInventory: true,
      },
    });
  }
}

console.log(
  `Enabling trackInventory on ${variationBatches.length} variations...`,
);
const upsertRes = await client.catalog.batchUpsert({
  idempotencyKey: `enable-inventory-${Date.now()}`,
  batches: [{ objects: variationBatches }],
});

const updatedCount = upsertRes.objects?.length ?? 0;
console.log(`✓ Updated ${updatedCount} variations\n`);

// 4. Set physical inventory count to 1 for each variation
const now = new Date().toISOString();
const changes = variationBatches.map((v) => ({
  type: "PHYSICAL_COUNT",
  physicalCount: {
    catalogObjectId: v.id,
    quantity: "1",
    state: "IN_STOCK",
    locationId,
    occurredAt: now,
  },
}));

console.log(`Setting inventory count to 1 for ${changes.length} items...`);
const invRes = await client.inventory.batchCreateChanges({
  idempotencyKey: `set-inventory-1-${Date.now()}`,
  changes,
});

const counts = invRes.counts?.length ?? 0;
console.log(`✓ Set inventory counts (${counts} updated)\n`);

console.log("Done. All pieces now track inventory at quantity 1.");

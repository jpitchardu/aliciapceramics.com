import { SquareClient, SquareEnvironment } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Production,
});

const locationId = process.env.SQUARE_LOCATION_ID;

// Fetch all orders (all pages)
const allOrders = [];
let cursor;
do {
  const res = await client.orders.search({
    locationIds: [locationId],
    query: { sort: { sortField: "CREATED_AT", sortOrder: "DESC" } },
    limit: 100,
    ...(cursor ? { cursor } : {}),
  });
  if (res.orders) allOrders.push(...res.orders);
  cursor = res.cursor;
} while (cursor);

// Only count OPEN and COMPLETED orders (not DRAFT or CANCELED)
const paidOrders = allOrders.filter(
  (o) => o.state === "OPEN" || o.state === "COMPLETED",
);
console.log(
  `Total orders: ${allOrders.length} | Paid (OPEN/COMPLETED): ${paidOrders.length}\n`,
);

const soldItemNames = new Set();
for (const order of paidOrders) {
  for (const li of order.lineItems ?? []) {
    if (li.name) soldItemNames.add(li.name);
  }
}
console.log(`Unique item names across paid orders: ${soldItemNames.size}`);

// Fetch full catalog
const catalogObjects = [];
for await (const obj of await client.catalog.list({ types: "ITEM" })) {
  catalogObjects.push(obj);
}
const itemIds = catalogObjects.map((o) => o.id).filter(Boolean);
const { objects: fullItems = [] } = await client.catalog.batchGet({
  objectIds: itemIds,
});

// Map item name -> variation ID
const nameToVariationId = new Map();
for (const item of fullItems) {
  const name = item.itemData?.name;
  const varId = item.itemData?.variations?.[0]?.id;
  if (name && varId) nameToVariationId.set(name, varId);
}

// Match sold items to variation IDs
const toCheck = new Map(); // variationId -> name
const unmatched = [];
for (const name of soldItemNames) {
  const varId = nameToVariationId.get(name);
  if (varId) toCheck.set(varId, name);
  else unmatched.push(name);
}

if (unmatched.length) {
  console.log(
    `\nNo catalog match (likely old/renamed items — skipping):\n  ${unmatched.join("\n  ")}`,
  );
}

// Check current inventory for matched items
const counts = new Map();
for await (const count of await client.inventory.batchGetCounts({
  catalogObjectIds: [...toCheck.keys()],
  locationIds: [locationId],
})) {
  if (count.catalogObjectId) {
    counts.set(count.catalogObjectId, Number(count.quantity ?? 0));
  }
}

const needsZero = [...toCheck.entries()].filter(
  ([varId]) => (counts.get(varId) ?? 0) > 0,
);
const alreadyZero = [...toCheck.entries()].filter(
  ([varId]) => (counts.get(varId) ?? 0) === 0,
);

console.log(`\nAlready at 0 (${alreadyZero.length}):`);
for (const [, name] of alreadyZero) console.log(`  ✓ ${name}`);

if (needsZero.length === 0) {
  console.log("\nAll sold items are already at 0. Nothing to do.");
} else {
  console.log(`\nNeeds zeroing (${needsZero.length}):`);
  for (const [, name] of needsZero) console.log(`  ! ${name}`);

  await client.inventory.batchCreateChanges({
    idempotencyKey: crypto.randomUUID(),
    changes: needsZero.map(([variationId]) => ({
      type: "PHYSICAL_COUNT",
      physicalCount: {
        catalogObjectId: variationId,
        locationId,
        state: "IN_STOCK",
        quantity: "0",
        occurredAt: new Date().toISOString(),
      },
    })),
  });
  console.log("\nDone — zeroed out.");
}

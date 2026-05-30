import { SquareClient, SquareEnvironment } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Production,
});

const locationId = process.env.SQUARE_LOCATION_ID;

const TODAY_OPEN_ORDER_IDS = [
  "5uzGNiuSGjJmiqBf1oY7q3fowHWZY",
  "rdOYQVwiko5jFnxhgJ9itrjXE7PZY",
  "Hr6gh9LFTcPGCiavos9rdmI026cZY",
  "JgEotfEL5Ka31ad4hGD6bXgIDuaZY",
  "ZirHOJ4zDQ2bcygBsagfWOTjdENZY",
  "hMObOy4w6TDK9vuG1F83ZOo75hVZY",
  "XnoqfeIc5mgAZ6Yiv3392wmemn7YY",
  "DRyQU7vEGNCnqgpcbSHUDrrVZLAZY",
  "V41OC3bSIeRLs9A9bIGGqhJYv6YZY",
];

function extractContact(order) {
  const fulfillment = order.fulfillments?.[0];
  const recipient =
    fulfillment?.shipmentDetails?.recipient ??
    fulfillment?.pickupDetails?.recipient ??
    fulfillment?.deliveryDetails?.recipient;
  const tenderBuyer = order.tenders?.[0]?.cardDetails?.card?.cardholderName;
  return {
    name: recipient?.displayName ?? tenderBuyer ?? "",
    email: recipient?.emailAddress ?? "",
    phone: recipient?.phoneNumber ?? "",
  };
}

async function getCustomerContact(customerId) {
  if (!customerId) return null;
  try {
    const res = await client.customers.get({ customerId });
    const c = res.customer;
    return {
      name: [c?.givenName, c?.familyName].filter(Boolean).join(" "),
      email: c?.emailAddress ?? "",
      phone: c?.phoneNumber ?? "",
    };
  } catch {
    return null;
  }
}

const results = await client.orders.batchGet({
  locationIds: [locationId],
  orderIds: TODAY_OPEN_ORDER_IDS,
});

const orders = (results.orders ?? []).sort((a, b) =>
  a.createdAt.localeCompare(b.createdAt),
);

for (const order of orders) {
  let contact = extractContact(order);

  const customerId = order.tenders?.[0]?.customerId;
  if (!contact.email && !contact.phone && customerId) {
    const cc = await getCustomerContact(customerId);
    if (cc) contact = cc;
  }

  const items = (order.lineItems ?? [])
    .map((li) => `  - ${li.name} x${li.quantity}`)
    .join("\n");
  const total = order.totalMoney
    ? `$${(Number(order.totalMoney.amount) / 100).toFixed(2)}`
    : "?";

  console.log(`Order: ${order.id}`);
  console.log(`  State:   ${order.state}`);
  console.log(`  Created: ${order.createdAt}`);
  console.log(`  Total:   ${total}`);
  console.log(`  Name:    ${contact.name || "(none)"}`);
  console.log(`  Email:   ${contact.email || "(none)"}`);
  console.log(`  Phone:   ${contact.phone || "(none)"}`);
  console.log(`  Items:\n${items}`);
  console.log();
}

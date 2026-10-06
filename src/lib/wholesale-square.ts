import type { Square, SquareClient } from "square";
import {
  CAT,
  countPieces,
  lineLabel,
  sizeLabel,
  type BulkCode,
  type BulkOrder,
  type OrderLine,
  type PieceType,
} from "@/lib/wholesale";

/*
 * Turns a bulk order from /wholesale into Square records alicia works from:
 * the shop as a customer, an order priced from the "Wholesale …" catalog
 * items, and a DRAFT invoice on it. Nothing is sent to the shop — alicia
 * reviews the draft, adds any extra charges (a design, a logo stamp), sets
 * the deposit and publishes it, or deletes it to decline.
 *
 * Prices live in Square. Items are found by name so she can edit prices in
 * the Dashboard without touching code; a piece that can't be matched (or
 * "something else") goes on as a $0 line for her to price.
 */

/* the Square item each piece type is priced from; "other" is always custom */
export const SQUARE_ITEM_NAMES: Record<PieceType, string | null> = {
  cup: "Wholesale No Handle Mug",
  "mug-with-handle": "Wholesale Handle Mug",
  tumbler: "Wholesale Sippy Mug",
  "matcha-bowl": "Wholesale Matcha Bowl",
  "trinket-dish": "Wholesale Jewelry Dish",
  other: null,
};

/* item name (lowercase) → variation name (lowercase) → variation id */
export type WholesaleCatalog = Map<string, Map<string, string>>;

export const isSquareOrderingOn = () =>
  process.env.WHOLESALE_SQUARE_ORDERS === "on" &&
  !!process.env.SQUARE_ACCESS_TOKEN &&
  !!process.env.SQUARE_LOCATION_ID;

export async function fetchWholesaleCatalog(
  client: SquareClient,
): Promise<WholesaleCatalog> {
  const { objects = [] } = await client.catalog.search({
    objectTypes: ["ITEM"],
    query: {
      prefixQuery: { attributeName: "name", attributePrefix: "wholesale" },
    },
  });
  const catalog: WholesaleCatalog = new Map();
  for (const obj of objects) {
    if (obj.type !== "ITEM" || obj.isDeleted) continue;
    const name = obj.itemData?.name?.trim().toLowerCase();
    if (!name) continue;
    const variations = new Map<string, string>();
    for (const v of obj.itemData?.variations ?? []) {
      const vName =
        v.type === "ITEM_VARIATION"
          ? v.itemVariationData?.name?.trim().toLowerCase()
          : undefined;
      if (vName && v.id) variations.set(vName, v.id);
    }
    catalog.set(name, variations);
  }
  return catalog;
}

/* the variation a line is priced from, or null to price it by hand */
export function findVariation(
  line: Pick<OrderLine, "type" | "size">,
  catalog: WholesaleCatalog,
): string | null {
  const itemName = SQUARE_ITEM_NAMES[line.type];
  if (!itemName) return null;
  const variations = catalog.get(itemName.toLowerCase());
  if (!variations) return null;
  if (line.size) return variations.get(sizeLabel(line.size)) ?? null;
  // one-size pieces: the item's only variation, whatever it's called
  return variations.size === 1 ? [...variations.values()][0] : null;
}

const USD = "USD" as Square.Currency;

export function buildLineItems(
  lines: readonly OrderLine[],
  catalog: WholesaleCatalog,
): Square.OrderLineItem[] {
  return lines.map((line) => {
    const quantity = String(line.quantity);
    const note = line.description || undefined;
    const variationId = findVariation(line, catalog);
    if (variationId) return { catalogObjectId: variationId, quantity, note };
    return {
      name: line.type === "other" ? CAT.other.label : lineLabel(line),
      quantity,
      basePriceMoney: { amount: BigInt(0), currency: USD },
      note:
        line.type === "other"
          ? note
          : [note, "(no wholesale price found in square)"]
              .filter(Boolean)
              .join(" "),
    };
  });
}

/* Square wants E.164; anything that isn't a plain US number is left off */
export function toE164(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return undefined;
}

export function invoiceDescription(order: BulkOrder): string {
  const { contact } = order;
  return [
    `bulk order from ${contact.business} — ${contact.name}, ${contact.email}${
      contact.phone ? `, ${contact.phone}` : ""
    }.`,
    `${countPieces(order.lines)} pieces.`,
    order.inspiration && `inspiration: ${order.inspiration}`,
    order.notes && `their note: ${order.notes}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function findOrCreateCustomer(
  client: SquareClient,
  order: BulkOrder,
  key: string,
): Promise<string> {
  const { contact } = order;
  const { customers = [] } = await client.customers.search({
    query: { filter: { emailAddress: { exact: contact.email } } },
    limit: BigInt(1),
  });
  if (customers[0]?.id) return customers[0].id;

  const { customer } = await client.customers.create({
    idempotencyKey: `${key}-customer`,
    givenName: contact.name,
    companyName: contact.business,
    emailAddress: contact.email,
    phoneNumber: toE164(contact.phone),
    note: "wholesale — came in through the bulk order form",
  });
  if (!customer?.id) throw new Error("square returned no customer");
  return customer.id;
}

export type SquareBulkOrderResult = { orderId: string; invoiceId: string };

/*
 * `submissionId` is generated once per order on the client, so a double
 * click or a retry after a timeout reuses the same Square records instead
 * of creating duplicates.
 */
export async function createSquareBulkOrder(
  client: SquareClient,
  order: BulkOrder,
  code: BulkCode,
  submissionId: string,
): Promise<SquareBulkOrderResult> {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error("SQUARE_LOCATION_ID is not set");
  const key = `ws-${submissionId}`;

  const [catalog, customerId] = await Promise.all([
    fetchWholesaleCatalog(client),
    findOrCreateCustomer(client, order, key),
  ]);

  const { order: created } = await client.orders.create({
    idempotencyKey: `${key}-order`,
    order: {
      locationId,
      customerId,
      referenceId: code.code.slice(0, 40),
      lineItems: buildLineItems(order.lines, catalog),
    },
  });
  if (!created?.id) throw new Error("square returned no order");

  const { invoice } = await client.invoices.create({
    idempotencyKey: `${key}-invoice`,
    invoice: {
      locationId,
      orderId: created.id,
      primaryRecipient: { customerId },
      deliveryMethod: "EMAIL",
      title: `bulk order · ${code.code}`.slice(0, 255),
      description: invoiceDescription(order),
      // one balance due on the code's completion date — alicia splits it
      // into a deposit + balance when she accepts the order
      paymentRequests: [{ requestType: "BALANCE", dueDate: code.earliest }],
      acceptedPaymentMethods: { card: true, bankAccount: true },
    },
  });
  if (!invoice?.id) throw new Error("square returned no invoice");

  return { orderId: created.id, invoiceId: invoice.id };
}

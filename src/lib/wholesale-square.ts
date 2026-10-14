import type { Square, SquareClient } from "square";
import {
  CAT,
  CUSTOM_SIZE,
  countPieces,
  lineLabel,
  sizeLabel,
  type BulkCode,
  type BulkOrder,
  type OrderKind,
  type OrderLine,
  type PieceType,
} from "@/lib/wholesale";
import { unitPrice } from "@/lib/commission-prices";

/*
 * Turns a bulk order from /wholesale (or a small commission from
 * /commission) into Square records alicia works from:
 * the shop as a customer, an order priced from the "Wholesale …" catalog
 * items, and a DRAFT invoice on it. Nothing is sent to the shop — alicia
 * reviews the draft, adds any extra charges (a design, a logo stamp), sets
 * the deposit and publishes it, or deletes it to decline.
 *
 * Prices live in Square. Items are found by name so she can edit prices in
 * the Dashboard without touching code; a piece that can't be matched (or
 * "something else") goes on as a $0 line for her to price.
 */

/*
 * Where what they typed lands, like special instructions on a delivery
 * order: each piece's details are that line's note, and their note to
 * alicia plus their inspiration are the order's note (a pickup note, the
 * only order-level note Square has — max 500 characters). Both are their
 * own words. The invoice description is just a short thank-you, and their
 * phone lives on the customer profile.
 */
export const ORDER_NOTE_MAX = 500;

/* the Square item each piece type is priced from; "other" is always custom.
 * Commissions don't use these — they're priced from the regular price sheet. */
export const SQUARE_ITEM_NAMES: Record<PieceType, string | null> = {
  cup: "Wholesale No Handle Mug",
  "mug-with-handle": "Wholesale Handle Mug",
  tumbler: "Wholesale Sippy Mug",
  "espresso-cup": "Wholesale Espresso Cup",
  "cortado-cup": "Wholesale Cortado Cup",
  "matcha-bowl": "Wholesale Matcha Bowl",
  "trinket-dish": "Wholesale Jewelry Dish",
  other: null,
};

/* item name (lowercase) → variation name (lowercase) → variation id */
export type WholesaleCatalog = Map<string, Map<string, string>>;

/* orders go to square wherever the site has square credentials */
export const hasSquareCredentials = () =>
  !!process.env.SQUARE_ACCESS_TOKEN && !!process.env.SQUARE_LOCATION_ID;

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

/* a design is its own variation: "8 oz · with a design", or "with a
 * design" on a one-size piece */
export const DESIGN_VARIATION = "with a design";

/* the variation a line is priced from, or null to price it by hand */
export function findVariation(
  line: Pick<OrderLine, "type" | "size" | "design">,
  catalog: WholesaleCatalog,
): string | null {
  const itemName = SQUARE_ITEM_NAMES[line.type];
  // a custom size has no catalog price — alicia prices it by hand
  if (!itemName || line.size === CUSTOM_SIZE) return null;
  const variations = catalog.get(itemName.toLowerCase());
  if (!variations) return null;
  if (line.size) {
    const size = sizeLabel(line.size);
    return (
      variations.get(line.design ? `${size} · ${DESIGN_VARIATION}` : size) ??
      null
    );
  }
  if (line.design) return variations.get(DESIGN_VARIATION) ?? null;
  // one-size pieces: the item's only plain variation, whatever it's called
  const plain = [...variations].filter(([n]) => !n.includes(DESIGN_VARIATION));
  return plain.length === 1 ? plain[0][1] : null;
}

const USD = "USD" as Square.Currency;

export function buildLineItems(
  lines: readonly OrderLine[],
  catalog: WholesaleCatalog,
): Square.OrderLineItem[] {
  return lines.map((line) => {
    const quantity = String(line.quantity);
    // only their own words — a $0 line already says it needs pricing
    const note = line.description || undefined;
    const variationId = findVariation(line, catalog);
    if (variationId) return { catalogObjectId: variationId, quantity, note };
    return {
      name: line.type === "other" ? CAT.other.label : lineLabel(line),
      quantity,
      basePriceMoney: { amount: BigInt(0), currency: USD },
      note,
    };
  });
}

/* commission lines carry their price-sheet price; anything without one is
 * a $0 line for alicia to price */
export function buildCommissionLineItems(
  lines: readonly OrderLine[],
): Square.OrderLineItem[] {
  return lines.map((line) => ({
    name: lineLabel(line),
    quantity: String(line.quantity),
    basePriceMoney: { amount: BigInt(unitPrice(line) ?? 0), currency: USD },
    note: line.description || undefined,
  }));
}

/* Square wants E.164; anything that isn't a plain US number is left off */
export function toE164(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return undefined;
}

const KIND_NAME: Record<OrderKind, string> = {
  wholesale: "bulk order",
  commission: "commission",
};

/* printed on the invoice the customer gets — a thank-you, nothing they
 * typed; alicia can rewrite it before she sends it */
export function invoiceDescription(
  order: BulkOrder,
  kind: OrderKind = "wholesale",
): string {
  const n = countPieces(order.lines);
  return `thank you for your ${KIND_NAME[kind]} — ${n} ${
    n === 1 ? "piece" : "pieces"
  }, each one made by hand.`;
}

/* their note and inspiration, as the order's special instructions */
export function orderNote(order: BulkOrder): string | null {
  const phone =
    order.contact.phone && !toE164(order.contact.phone)
      ? `phone: ${order.contact.phone}`
      : "";
  const note = [
    order.notes && `their note: ${order.notes}`,
    order.inspiration && `inspiration: ${order.inspiration}`,
    // a number Square couldn't store on the profile
    phone,
  ]
    .filter(Boolean)
    .join("\n\n");
  if (!note) return null;
  return note.length > ORDER_NOTE_MAX
    ? `${note.slice(0, ORDER_NOTE_MAX - 1)}…`
    : note;
}

/* the order note rides on a pickup, the only order-level note Square has;
 * dated for the estimated completion, midday in dallas */
export function notesFulfillment(
  order: BulkOrder,
  code: BulkCode,
): Square.Fulfillment[] | undefined {
  const note = orderNote(order);
  if (!note) return undefined;
  return [
    {
      type: "PICKUP",
      state: "PROPOSED",
      pickupDetails: {
        scheduleType: "SCHEDULED",
        pickupAt: `${code.earliest}T18:00:00Z`,
        note,
        recipient: {
          displayName: order.contact.name,
          emailAddress: order.contact.email,
          phoneNumber: toE164(order.contact.phone),
        },
      },
    },
  ];
}

async function findOrCreateCustomer(
  client: SquareClient,
  order: BulkOrder,
  key: string,
  kind: OrderKind,
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
    companyName: contact.business || undefined,
    emailAddress: contact.email,
    phoneNumber: toE164(contact.phone),
    note:
      kind === "wholesale"
        ? "wholesale — came in through the bulk order form"
        : "commission — came in through the commission form",
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
  kind: OrderKind = "wholesale",
): Promise<SquareBulkOrderResult> {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error("SQUARE_LOCATION_ID is not set");
  const key = `ws-${submissionId}`;

  const [lineItems, customerId] = await Promise.all([
    kind === "wholesale"
      ? fetchWholesaleCatalog(client).then((catalog) =>
          buildLineItems(order.lines, catalog),
        )
      : buildCommissionLineItems(order.lines),
    findOrCreateCustomer(client, order, key, kind),
  ]);

  const { order: created } = await client.orders.create({
    idempotencyKey: `${key}-order`,
    order: {
      locationId,
      customerId,
      referenceId: code.code.slice(0, 40),
      lineItems,
      fulfillments: notesFulfillment(order, code),
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
      title: `${KIND_NAME[kind]} · ${code.code}`.slice(0, 255),
      description: invoiceDescription(order, kind),
      // one balance due on the code's completion date — alicia splits it
      // into a deposit + balance when she accepts the order
      paymentRequests: [{ requestType: "BALANCE", dueDate: code.earliest }],
      acceptedPaymentMethods: { card: true, bankAccount: true },
    },
  });
  if (!invoice?.id) throw new Error("square returned no invoice");

  return { orderId: created.id, invoiceId: invoice.id };
}

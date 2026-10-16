import { z } from "zod";
import type { Square, SquareClient } from "square";
import { FORMATS, formatFor, PLACES, PRIVATE_NOTE_MAX } from "@/lib/classes";
import {
  ORDER_NOTE_MAX,
  findOrCreateCustomer,
  toE164,
} from "@/lib/wholesale-square";

/*
 * A private event request — the studio to themselves, or the tools brought
 * to a place of their own. Nothing is charged: it lands in Square like a
 * commission does, as the person, an order and an unsent draft invoice
 * alicia prices and sends (or deletes to say no). The order is priced at
 * the "from" rate per head; travel comes in at $0 for her to fill in.
 */

/* the "from $55 a head" rate, in cents */
export const PER_HEAD = 5500;
export const STUDIO_MAX = 10;
export const NOTE_MAX = PRIVATE_NOTE_MAX;

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const privateRequestSchema = z
  .object({
    /* made once per request on the page — keeps retries idempotent */
    submissionId: z.uuid(),
    place: z.enum(["studio", "yours"]),
    address: z.string().trim().max(120),
    format: z.enum(["handbuilding", "painting"]),
    dates: z
      .array(z.object({ date: isoDay, label: z.string().trim().max(40) }))
      .max(3),
    guests: z.number().int().min(1).max(200),
    occasion: z.string().trim().max(80),
    name: z.string().trim().min(1, "your name, please").max(120),
    email: z.email("that email doesn't look right"),
    phone: z.string().trim().max(30),
    notes: z.string().trim().max(NOTE_MAX),
  })
  .refine((r) => r.place === "studio" || r.address, {
    message: "roughly where are we coming to?",
    path: ["address"],
  })
  .refine((r) => r.place === "yours" || r.guests <= STUDIO_MAX, {
    message: "the studio holds ten — for more, choose a place of your own",
    path: ["guests"],
  })
  .refine((r) => r.format === formatFor(r.place), {
    message: "handbuilding at the studio, mug painting at yours",
    path: ["format"],
  })
  .refine((r) => r.dates.length > 0, {
    message: "pick at least one date",
    path: ["dates"],
  });
export type PrivateRequest = z.infer<typeof privateRequestSchema>;

const placeTitle = (r: PrivateRequest) =>
  PLACES.find((p) => p.id === r.place)!.title;
const formatTitle = (r: PrivateRequest) =>
  FORMATS.find((f) => f.id === r.format)!.title;

/* everything alicia needs to reply, as the order's note (max 500) */
export function requestNote(r: PrivateRequest): string {
  const dates = r.dates.map((d) => d.label).join("; ");
  const note = [
    `dates: ${dates}`,
    r.place === "yours" && `where: ${r.address}`,
    r.occasion && `occasion: ${r.occasion}`,
    r.phone && `phone: ${r.phone}`,
    r.notes && `their note: ${r.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
  return note.length > ORDER_NOTE_MAX
    ? `${note.slice(0, ORDER_NOTE_MAX - 1)}…`
    : note;
}

const addDays = (now: Date, days: number) =>
  new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);

export function requestLineItems(r: PrivateRequest): Square.OrderLineItem[] {
  const usd = "USD" as Square.Currency;
  return [
    {
      name: `private event · ${formatTitle(r)} · ${placeTitle(r)}`,
      quantity: String(r.guests),
      basePriceMoney: { amount: BigInt(PER_HEAD), currency: usd },
      note: `${r.guests} people, from $${PER_HEAD / 100} a head`,
    },
    ...(r.place === "yours"
      ? [
          {
            name: "travel",
            quantity: "1",
            basePriceMoney: { amount: BigInt(0), currency: usd },
          },
        ]
      : []),
  ];
}

export async function createSquarePrivateRequest(
  client: SquareClient,
  r: PrivateRequest,
  now: Date = new Date(),
): Promise<{ orderId: string; invoiceId: string }> {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error("SQUARE_LOCATION_ID is not set");
  const key = `pv-${r.submissionId}`;

  const customerId = await findOrCreateCustomer(
    client,
    { name: r.name, email: r.email, phone: r.phone },
    key,
    "private event — came in through the request form",
  );

  // the first date they picked, or a month out, for the pickup the note
  // rides on and the invoice's due date — alicia changes both as needed
  const soonest = r.dates.map((d) => d.date).sort()[0];
  const day = soonest && soonest > addDays(now, 0) ? soonest : addDays(now, 30);

  const { order } = await client.orders.create({
    idempotencyKey: `${key}-order`,
    order: {
      locationId,
      customerId,
      referenceId: "private event",
      lineItems: requestLineItems(r),
      fulfillments: [
        {
          type: "PICKUP",
          state: "PROPOSED",
          pickupDetails: {
            scheduleType: "SCHEDULED",
            pickupAt: `${day}T18:00:00Z`,
            note: requestNote(r),
            recipient: {
              displayName: r.name,
              emailAddress: r.email,
              phoneNumber: toE164(r.phone),
            },
          },
        },
      ],
    },
  });
  if (!order?.id) throw new Error("square returned no order");

  const { invoice } = await client.invoices.create({
    idempotencyKey: `${key}-invoice`,
    invoice: {
      locationId,
      orderId: order.id,
      primaryRecipient: { customerId },
      deliveryMethod: "EMAIL",
      title: "private event",
      description: `thank you — here's the plan for your ${formatTitle(r)} event, ${placeTitle(r)}.`,
      paymentRequests: [{ requestType: "BALANCE", dueDate: day }],
      acceptedPaymentMethods: { card: true, bankAccount: true },
    },
  });
  if (!invoice?.id) throw new Error("square returned no invoice");
  return { orderId: order.id, invoiceId: invoice.id };
}

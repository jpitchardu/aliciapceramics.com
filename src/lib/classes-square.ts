import type { CatalogObject } from "square";
import { squareClient } from "@/lib/square";
import { EVENTS_CATEGORY_NAME } from "@/lib/config";
import { heldSeats, releaseStaleHolds } from "@/lib/holds";
import { collabDetails } from "@/lib/drinks";
import {
  SAMPLE_EVENTS,
  upcoming,
  type ClassEvent,
  type PieceOption,
  type Session,
} from "@/lib/classes";

/*
 * Classes, read live from Square. Alicia sets each one up in the Dashboard:
 *
 *  - an item in the "events" category; its name, description and photo are
 *    the class's
 *  - its (first) variation's price is the base ticket, and its stock count
 *    is the seats left — checkout moves sold seats out of stock
 *  - an optional modifier list holds the pieces a seat can be made into,
 *    each modifier priced at its upgrade ($0 when it's included)
 *  - custom attributes, matched by name, carry the rest:
 */
export const CLASS_ATTRS = {
  date: "class date",
  time: "class time",
  date2: "second date",
  time2: "second time",
  tag: "class tag",
  make: "you'll leave with",
  duration: "how long",
  seats: "total seats",
  /* "poppy & fern @poppyandfern" — the handle is split off */
  collabWith: "collab with",
  collabNote: "collab note",
} as const;

export const hasSquare = () => !!process.env.SQUARE_ACCESS_TOKEN;

/* "2026-11-19", "11/19/2026", "nov 19 2026" → "2026-11-19"; else null */
export function parseDay(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) return iso(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[1], +m[2]);
  const t = Date.parse(`${s} 12:00 UTC`);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

function iso(y: number, mo: number, d: number): string | null {
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

/* today in dallas, YYYY-MM-DD */
export const todayInDallas = (now = new Date()) =>
  now.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

type Attrs = Record<string, { name?: string; stringValue?: string }>;
const attr = (attrs: Attrs, name: string) =>
  Object.values(attrs)
    .find((a) => a.name?.trim().toLowerCase() === name)
    ?.stringValue?.trim() ?? "";

/*
 * One Square item → a class, or null when it isn't one we can show: not
 * dated, already past, or without a priced variation.
 */
export function mapClass(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  related: ReadonlyMap<string, CatalogObject>,
  counts: ReadonlyMap<string, number>,
  today: string,
): ClassEvent | null {
  const data = item?.itemData;
  if (!data || item.isDeleted || data.isArchived) return null;
  const attrs: Attrs = item.customAttributeValues ?? {};
  const a = (k: keyof typeof CLASS_ATTRS) => attr(attrs, CLASS_ATTRS[k]);

  const date = parseDay(a("date"));
  if (!date || date < today) return null;
  const sessions: Session[] = [{ date, time: a("time") }];
  const date2 = parseDay(a("date2"));
  if (date2) sessions.push({ date: date2, time: a("time2") || a("time") });

  const variation = data.variations?.[0];
  const amount = variation?.itemVariationData?.priceMoney?.amount;
  if (!variation?.id || amount === undefined || amount === null) return null;

  const seatsAttr = Number.parseInt(a("seats"), 10);
  const seats = Number.isFinite(seatsAttr) ? seatsAttr : undefined;
  const left = Math.max(0, counts.get(variation.id) ?? 0);

  // the first modifier list switched on for this item holds the pieces
  const listId = (data.modifierListInfo ?? []).find(
    (m: { enabled?: boolean }) => m.enabled !== false,
  )?.modifierListId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = listId ? (related.get(listId) as any) : undefined;
  const pieces: PieceOption[] = (list?.modifierListData?.modifiers ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((m: any) => m.id && !m.isDeleted && m.modifierData?.name)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m: any) => ({
      id: m.id,
      name: m.modifierData.name.trim(),
      extra: Number(m.modifierData.priceMoney?.amount ?? 0) / 100,
    }));

  const imageId = data.imageIds?.[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photo =
    (imageId && (related.get(imageId) as any)?.imageData?.url) ||
    "/assets/photo-placeholder.png";

  // "poppy & fern @poppyandfern" → name + handle
  const collabRaw = a("collabWith");
  const handle = collabRaw.match(/@([\w.]+)/)?.[1] ?? "";
  const collabWith = collabRaw.replace(/@[\w.]+/, "").trim();
  const description = (
    data.descriptionPlaintext ??
    data.description ??
    ""
  ).trim();

  return {
    id: item.id,
    variationId: variation.id,
    title: (data.name ?? "a class").trim(),
    kind: a("tag"),
    sessions,
    duration: a("duration"),
    price: Number(amount) / 100,
    seats,
    left,
    pieces,
    photo,
    make: a("make"),
    blurb: description,
    collab: collabWith
      ? {
          with: collabWith,
          handle,
          trade: "",
          brings: "",
          aliciaBrings: "",
          // a collaborator we know fills in the rest of the card
          ...collabDetails(collabWith),
          note: a("collabNote"),
        }
      : undefined,
  };
}

async function fetchFromSquare(): Promise<ClassEvent[]> {
  const categories = await squareClient.catalog.list({ types: "CATEGORY" });
  let eventsId: string | undefined;
  for await (const c of categories) {
    if (
      c.type === "CATEGORY" &&
      c.categoryData?.name?.trim().toLowerCase() === EVENTS_CATEGORY_NAME
    ) {
      eventsId = c.id;
      break;
    }
  }
  if (!eventsId) return [];

  const { items = [] } = await squareClient.catalog.searchItems({
    categoryIds: [eventsId],
  });
  const ids = items.map((i) => i.id!).filter(Boolean);
  if (!ids.length) return [];

  // search leaves out custom attributes; a batch get has them, plus the
  // modifier lists and images
  const { objects = [], relatedObjects = [] } =
    await squareClient.catalog.batchGet({
      objectIds: ids,
      includeRelatedObjects: true,
    });
  const related = new Map(
    relatedObjects.filter((o) => o.id).map((o) => [o.id!, o]),
  );

  const variationIds = objects.flatMap((o) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((o as any).itemData?.variations ?? [])
      .map((v: any) => v.id)
      .filter(Boolean),
  );
  const counts = new Map<string, number>();
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (locationId && variationIds.length) {
    const page = await squareClient.inventory.batchGetCounts({
      catalogObjectIds: variationIds,
      locationIds: [locationId],
    });
    for await (const c of page) {
      if (c.catalogObjectId && (!c.state || c.state === "IN_STOCK")) {
        counts.set(c.catalogObjectId, Number(c.quantity ?? 0));
      }
    }
  }

  const today = todayInDallas();
  return objects
    .map((o) => mapClass(o, related, counts, today))
    .filter((e): e is ClassEvent => e !== null);
}

/* every upcoming class, soonest first — samples when Square isn't set up */
export async function getClasses(): Promise<ClassEvent[]> {
  if (!hasSquare()) return upcoming(SAMPLE_EVENTS);
  // kill links from checkouts nobody finished, so they can't pay late
  await releaseStaleHolds(squareClient).catch((err) =>
    console.error("[classes] couldn't release unpaid holds:", err),
  );
  try {
    // seats in someone's unpaid checkout are taken, though still in stock
    const [events, held] = await Promise.all([
      fetchFromSquare(),
      heldSeats(squareClient).catch((err) => {
        console.error("[classes] couldn't count held seats:", err);
        return new Map<string, number>();
      }),
    ]);
    return upcoming(
      events.map((e) =>
        e.variationId && held.has(e.variationId)
          ? { ...e, left: Math.max(0, e.left - held.get(e.variationId)!) }
          : e,
      ),
    );
  } catch (err) {
    console.error("[classes] couldn't read classes from square:", err);
    return [];
  }
}

export async function getClass(id: string): Promise<ClassEvent | null> {
  return (await getClasses()).find((e) => e.id === id) ?? null;
}

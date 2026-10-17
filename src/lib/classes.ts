/*
 * Classes at the studio — two ways to book.
 *
 *  1. Ticketed events alicia schedules herself: a date, a time, a handful of
 *     seats at a per-seat price. Names change every time, so the date leads.
 *     Some run over two sessions (one seat covers both, because the clay has
 *     to dry in between); some are collaborations with another maker.
 *  2. Private events, by request: at the studio (up to ten) or at a place of
 *     the guest's own (travel added, handbuilding only). Nothing is charged —
 *     alicia replies by hand.
 *
 * Each class is a Square item in the "events" category: its price is the
 * base ticket, its stock is the seats left, and an optional modifier list
 * holds the pieces a seat can be made into, each with its upgrade price.
 * The date, time and the rest are custom attributes on the item (see
 * classes-square.ts). Without Square credentials (local dev, tests) the
 * samples below stand in.
 */

export type Session = {
  /* calendar day, YYYY-MM-DD (Dallas) */
  date: string;
  time: string;
  /* what happens in this session — two-session classes only */
  note?: string;
};

export type Collab = {
  with: string;
  handle: string;
  trade: string;
  brings: string;
  aliciaBrings: string;
  note: string;
};

/* a piece a seat can be made into — a Square modifier */
export type PieceOption = {
  id: string;
  name: string;
  /* dollars on top of the base ticket; 0 when it's included */
  extra: number;
};

export type ClassEvent = {
  id: string;
  /* the Square variation the seats are sold from (none for samples) */
  variationId?: string;
  title: string;
  kind: string;
  sessions: Session[];
  duration: string;
  /* the base ticket, in dollars per seat */
  price: number;
  /* every seat in the class, when known */
  seats?: number;
  left: number;
  /* what a seat can be made into; empty when the piece is set */
  pieces: PieceOption[];
  photo: string;
  make: string;
  blurb: string;
  /* the page's extra fact rows, after "you'll leave with / how long / where" */
  facts?: [string, string][];
  /* a line under the booking panel */
  aside?: string;
  sessionNote?: string;
  collab?: Collab;
};

export const STUDIO = "1300 South Polk St. unit 287, Dallas TX 75224";

const BRING_NOTHING: [string, string] = [
  "what to bring",
  "nothing — aprons, clay and tools are here. wear something you don't mind marking.",
];

export const SAMPLE_EVENTS: ClassEvent[] = [
  {
    id: "glaze-night",
    title: "glaze night",
    kind: "for current students",
    sessions: [{ date: "2026-11-05", time: "6:30 – 8 pm" }],
    duration: "about 1½ hours",
    price: 40,
    seats: 8,
    left: 5,
    photo: "/assets/piece-tall.png",
    pieces: [],
    make: "your own bisque-fired pieces, glazed and ready for the kiln.",
    blurb:
      "bring what you made in class and we'll glaze it together. i'll talk you through everything on the shelf and fire it all that week.",
    facts: [BRING_NOTHING],
  },
  {
    id: "create-your-own-mug",
    title: "create your own mug",
    kind: "beginners welcome",
    sessions: [{ date: "2026-11-14", time: "10 am – 12:30 pm" }],
    duration: "about 2½ hours",
    price: 85,
    seats: 6,
    left: 2,
    photo: "/assets/piece-cobalt.png",
    pieces: [
      { id: "sample-mug-8", name: "an 8 oz mug", extra: 0 },
      { id: "sample-mug-12", name: "a 12 oz mug", extra: 10 },
    ],
    make: "one mug with a pulled handle — i trim, glaze and fire it for you.",
    blurb:
      "a morning at the wheel making the one thing you'll actually use every day. we throw, then pull handles after a short break.",
    facts: [BRING_NOTHING],
  },
  {
    id: "an-evening-at-the-wheel",
    title: "an evening at the wheel",
    kind: "no experience needed",
    sessions: [{ date: "2026-11-19", time: "6:30 – 9 pm" }],
    duration: "about 2½ hours",
    price: 95,
    seats: 6,
    left: 6,
    photo: "/assets/piece-pour.png",
    pieces: [
      { id: "sample-cup", name: "a cup", extra: 0 },
      { id: "sample-mug", name: "a mug with a handle", extra: 8 },
      { id: "sample-vase", name: "a small vase", extra: 15 },
    ],
    make: "two thrown pieces, ready about three weeks later.",
    blurb:
      "we start with a wedged ball of clay. you'll learn to centre, open and pull a wall, and leave with two pieces to glaze.",
    facts: [BRING_NOTHING],
  },
  {
    id: "pinch-and-slab",
    title: "pinch + slab",
    kind: "a gentle first time with clay",
    sessions: [{ date: "2026-11-21", time: "10 am – 12 pm" }],
    duration: "about 2 hours",
    price: 75,
    seats: 8,
    left: 0,
    photo: "/assets/piece-speckled.png",
    pieces: [],
    make: "a small pinch bowl and a slab tray.",
    blurb:
      "no wheel, no rush. we build by hand — pinching a bowl and rolling a slab into a small tray.",
    facts: [BRING_NOTHING],
  },
  {
    id: "a-set-of-four-bowls",
    title: "a set of four bowls",
    kind: "a two-part class",
    sessions: [
      { date: "2026-12-03", time: "6:30 – 9 pm", note: "we throw all four" },
      { date: "2026-12-10", time: "6:30 – 9 pm", note: "trim, foot and glaze" },
    ],
    duration: "two evenings, a week apart",
    price: 175,
    seats: 6,
    left: 4,
    photo: "/assets/piece-speckled.png",
    pieces: [],
    make: "four bowls that stack and match — trimmed, footed and glazed by you.",
    blurb:
      "a set takes two evenings because the clay has to firm up before it can be trimmed. we throw all four the first night, then foot and glaze them the next.",
    sessionNote: "one seat covers both evenings — please come to both.",
    facts: [
      [
        "if you miss one",
        "tell me and i'll fit you into the next set's matching evening.",
      ],
    ],
    aside:
      "one payment covers both evenings — there's nothing more to pay on the night.",
  },
  {
    id: "vessel-and-stem",
    title: "vessel + stem",
    kind: "clay and flowers",
    sessions: [{ date: "2026-12-05", time: "10 am – 1 pm" }],
    duration: "about 3 hours",
    price: 145,
    seats: 10,
    left: 7,
    photo: "/assets/piece-pour.png",
    pieces: [
      { id: "sample-bud-vase", name: "a bud vase", extra: 0 },
      { id: "sample-tall-vase", name: "a tall vase", extra: 15 },
    ],
    make: "a thrown vase, and an arrangement cut to sit in it.",
    blurb:
      "we throw a vase in the morning while lila talks through what's in season. you'll take home the arrangement the same day, and the vase once it's fired.",
    collab: {
      with: "poppy & fern",
      handle: "poppyandfern",
      trade: "a flower studio two doors down",
      brings: "stems, shears and the arranging",
      aliciaBrings: "the clay, the wheel and the firing",
      note: "a flower studio two doors down — we've been meaning to do this since they moved in. seats are booked here, and the flowers are theirs.",
    },
    facts: [
      [
        "the vase",
        "fired and ready about three weeks later — i'll write when it's out.",
      ],
    ],
    aside:
      "ten seats for this one rather than six — two pairs of hands means we can take more of you.",
  },
];

/* soonest first */
export const upcoming = (events: readonly ClassEvent[]) =>
  [...events].sort((a, b) =>
    a.sessions[0].date.localeCompare(b.sessions[0].date),
  );

/* ── dates ───────────────────────────────────────────────────────── */

/* calendar days, read in UTC so a date never slips a day */
const day = (iso: string) => new Date(`${iso}T12:00:00Z`);
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  day(iso)
    .toLocaleDateString("en-US", { timeZone: "UTC", ...opts })
    .toLowerCase();

export const monthOf = (iso: string) => fmt(iso, { month: "short" });
export const dayOf = (iso: string) => String(day(iso).getUTCDate());
export const weekdayOf = (iso: string) => fmt(iso, { weekday: "long" });

/* "nov 19" */
export const shortDay = (iso: string) => `${monthOf(iso)} ${dayOf(iso)}`;

export const isMulti = (e: ClassEvent) => e.sessions.length > 1;
export const first = (e: ClassEvent) => e.sessions[0];
export const datesLabel = (e: ClassEvent) =>
  e.sessions.map((s) => shortDay(s.date)).join(" & ");
export const timeLabel = (e: ClassEvent) => first(e).time;
/* "thursday nov 19" */
export const whenLabel = (s: Session) =>
  `${weekdayOf(s.date)} ${shortDay(s.date)}`;

/* ── seats ───────────────────────────────────────────────────────── */

export const isSoldOut = (e: ClassEvent) => e.left <= 0;
/* quiet until it's genuinely low */
export const isLow = (e: ClassEvent) => e.left > 0 && e.left <= 2;
export const seatNote = (e: ClassEvent) => {
  if (isSoldOut(e)) return "sold out";
  if (isLow(e)) return `only ${e.left} seat${e.left === 1 ? "" : "s"} left`;
  return `${e.left} seats open`;
};

/* the seat count a link asks for, kept between one and what's left */
export const clampSeats = (e: ClassEvent, n: unknown) => {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(e.left, v));
};

export const money = (n: number) => `$${n}`;

/* the soonest open event that isn't this one — "the next one like it" */
export const nextOpen = (e: ClassEvent, all: readonly ClassEvent[]) =>
  upcoming(all).find((o) => o.id !== e.id && !isSoldOut(o)) ?? null;

/* the class the home page leads with: the soonest one with seats */
export const featuredClass = (all: readonly ClassEvent[]) =>
  upcoming(all).find((e) => !isSoldOut(e)) ?? null;

/* ── pieces and prices ───────────────────────────────────────────── */

export const hasChoice = (e: ClassEvent) => e.pieces.length > 0;

/* what one seat costs with this piece */
export const seatPrice = (e: ClassEvent, pieceId: string | null) =>
  e.price + (e.pieces.find((p) => p.id === pieceId)?.extra ?? 0);

/* the lowest a seat can cost — "from $95" when there are upgrades */
export const fromPrice = (e: ClassEvent) =>
  e.price + (e.pieces.length ? Math.min(...e.pieces.map((p) => p.extra)) : 0);
export const hasUpgrades = (e: ClassEvent) =>
  new Set(e.pieces.map((p) => p.extra)).size > 1;

/* a new seat starts on the included piece (or the cheapest) */
export const defaultPiece = (e: ClassEvent) =>
  e.pieces.length
    ? [...e.pieces].sort((a, b) => a.extra - b.extra)[0].id
    : null;

export const total = (e: ClassEvent, picks: readonly (string | null)[]) =>
  picks.reduce((sum, id) => sum + seatPrice(e, id), 0);

/*
 * The seats a booking asks for, one piece per seat: the piece ids it names
 * must all belong to this class (or all be empty when the piece is set),
 * between one seat and what's left. Anything else is null.
 */
export function parsePicks(
  e: ClassEvent,
  raw: readonly (string | null | undefined)[],
): (string | null)[] | null {
  if (raw.length < 1 || raw.length > e.left) return null;
  const ids = new Set(e.pieces.map((p) => p.id));
  const picks = raw.map((r) => r || null);
  const ok = hasChoice(e)
    ? picks.every((p) => p !== null && ids.has(p))
    : picks.every((p) => p === null);
  return ok ? picks : null;
}

export const pieceName = (e: ClassEvent, id: string | null) =>
  e.pieces.find((p) => p.id === id)?.name ?? null;

/* ── private events ──────────────────────────────────────────────── */

export const PRIVATE = {
  title: "the studio, to yourselves",
  minGuests: 6,
  maxGuests: 10,
  priceNote: "from $55 a head",
  photo: "/assets/hero-group.png",
  blurb:
    "have the studio to yourselves — a few friends, a birthday, your team. tell me roughly when and how many, and i'll write back with a plan and a price.",
  windows: ["weekday evenings", "saturday mornings", "sunday afternoons"],
};

/* their note on a private request — it travels in Square's 500-character
 * order note with the dates and the rest */
export const PRIVATE_NOTE_MAX = 250;

export const PLACES = [
  {
    id: "studio",
    title: "here at the studio",
    cap: 10 as number | null,
    note: "everything's already where it needs to be — tables, glazes, kiln.",
    price: "from $55 a head",
    limit: "up to 10 comfortably",
  },
  {
    id: "yours",
    title: "a place of your own",
    cap: null as number | null,
    note: "i pack the tools into the car and bring them to you. mug painting only.",
    price: "from $55 a head + travel",
    limit: "travel quoted by distance",
  },
] as const;
export type PlaceId = (typeof PLACES)[number]["id"];

export const FORMATS = [
  {
    id: "handbuilding",
    title: "handbuilding",
    note: "pinch bowls and slab trays — easiest with a group",
  },
  {
    id: "painting",
    title: "mug painting",
    note: "a mug each to paint — i bring everything to you",
  },
] as const;
export type FormatId = (typeof FORMATS)[number]["id"];
/* handbuilding at the studio; mug painting when i come to you */
export const formatFor = (place: PlaceId): FormatId =>
  place === "yours" ? "painting" : "handbuilding";

/*
 * A few dates to suggest, two weeks out or more: the next thursday evening,
 * saturday morning and sunday afternoon after that, each with a label like
 * "thu nov 5 · evening".
 */
export type SuggestedDate = { date: string; part: string; label: string };

export function suggestedDates(today: Date): SuggestedDate[] {
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() + 14);
  const wanted: [number, string][] = [
    [4, "evening"],
    [6, "morning"],
    [0, "afternoon"],
  ];
  const picks = wanted.map(([dow, part]) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + ((dow - d.getUTCDay() + 7) % 7));
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      part,
      label: `${fmt(date, { weekday: "short" })} ${shortDay(date)} · ${part}`,
    };
  });
  // soonest first
  return picks.sort((a, b) => a.date.localeCompare(b.date));
}

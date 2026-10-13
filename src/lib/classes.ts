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
 * This is the preview: the events below are samples, and nothing here takes
 * money or creates anything in Square yet.
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

export type ClassEvent = {
  id: string;
  title: string;
  kind: string;
  sessions: Session[];
  duration: string;
  /* dollars per seat */
  price: number;
  seats: number;
  left: number;
  photo: string;
  make: string;
  blurb: string;
  /* the page's extra fact rows, after "you'll leave with / how long / where" */
  facts: [string, string][];
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

export const findEvent = (id: string) =>
  SAMPLE_EVENTS.find((e) => e.id === id) ?? null;

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
export const nextOpen = (e: ClassEvent) =>
  upcoming(SAMPLE_EVENTS).find((o) => o.id !== e.id && !isSoldOut(o)) ?? null;

/* ── private events ──────────────────────────────────────────────── */

export const PRIVATE = {
  title: "the studio, to yourselves",
  minGuests: 6,
  maxGuests: 12,
  priceNote: "from $55 a head",
  photo: "/assets/hero-group.png",
  blurb:
    "have the bench to yourselves — a few friends, a birthday, your team. tell me roughly when and how many, and i'll write back with a plan and a price.",
  windows: ["weekday evenings", "saturday mornings", "sunday afternoons"],
};

export const PLACES = [
  {
    id: "studio",
    title: "here at the studio",
    cap: 10 as number | null,
    note: "everything's already where it needs to be — wheels, glazes, kiln.",
    price: "from $55 a head",
    limit: "up to 10 comfortably",
  },
  {
    id: "yours",
    title: "a place of your own",
    cap: null as number | null,
    note: "i pack the bench into the van and bring it to you. handbuilding only — the wheels stay put.",
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
    id: "wheel",
    title: "at the wheel",
    note: "one thrown piece each; i'll be on my feet all night",
  },
] as const;
export type FormatId = (typeof FORMATS)[number]["id"];

/*
 * A few dates to suggest, two weeks out or more: the next thursday evening,
 * saturday morning and sunday afternoon after that. Returned as labels like
 * "thu nov 5 · evening".
 */
export function suggestedDates(today: Date): string[] {
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() + 14);
  const wanted: [number, string][] = [
    [4, "evening"],
    [6, "morning"],
    [0, "afternoon"],
  ];
  return wanted.map(([dow, part]) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + ((dow - d.getUTCDay() + 7) % 7));
    const iso = d.toISOString().slice(0, 10);
    return `${fmt(iso, { weekday: "short" })} ${shortDay(iso)} · ${part}`;
  });
}

import type { ClassEvent, Collab } from "@/lib/classes";

/*
 * Drinks at a collab class — one per seat, made to order by the
 * collaborator. Every choice is included in the ticket: nothing costs extra. The menu lives here rather than in Square
 * because a drink is four choices at once (which drink, iced or hot, which
 * milk, an optional syrup), more than a Square modifier list can say.
 *
 * A class gets a menu by naming the collaborator in its "collab with"
 * attribute in Square; COLLABORATORS fills in the rest of the collab card.
 */

export type Option = { id: string; name: string };

export type DrinkMenu = {
  from: string;
  drinks: (Option & { note: string; plain?: boolean })[];
  milks: Option[];
  syrups: Option[];
};

export const TEMPS = ["iced", "hot"] as const;
export type Temp = (typeof TEMPS)[number];

/* one seat's drink; syrup only on the plain one */
export type DrinkPick = {
  drink: string;
  temp: Temp;
  milk: string;
  syrup: string | null;
};
/* while a seat is still choosing */
export type DrinkDraft = Partial<DrinkPick> & { milk: string };

export const MENU_333: DrinkMenu = {
  from: "333 matcha",
  drinks: [
    {
      id: "matcha-latte",
      name: "matcha latte",
      note: "just matcha + milk — add a syrup if you like",
      plain: true,
    },
    {
      id: "miso-maple",
      name: "miso maple",
      note: "maple sweetness balanced with a subtle savory miso finish",
    },
    {
      id: "toasted-coco",
      name: "toasted coco",
      note: "rich toasted coconut with a warm, nutty sweetness",
    },
    {
      id: "chai",
      name: "chai",
      note: "cozy chai spices blended with matcha for a deeper, warming finish",
    },
    {
      id: "breakfast-club",
      name: "the breakfast club",
      note: "english breakfast tea with warm, malty notes layered into matcha + milk",
    },
    {
      id: "honey-im-home",
      name: "honey, i'm home",
      note: "smooth honey + vanilla for something soft, familiar, and lightly sweet",
    },
    {
      id: "the-earl",
      name: "the earl",
      note: "bright bergamot and black tea for a floral, citrusy twist on matcha",
    },
  ],
  milks: [
    { id: "cow", name: "cow milk" },
    { id: "oat", name: "oat milk" },
    { id: "pistachio", name: "pistachio milk" },
  ],
  syrups: [
    { id: "chai", name: "chai" },
    { id: "earl-grey", name: "earl grey" },
    { id: "maple-miso", name: "maple miso" },
    { id: "toasted-coconut", name: "toasted coconut" },
    { id: "honey-vanilla", name: "honey vanilla" },
    { id: "english-breakfast", name: "english breakfast" },
  ],
};

type Collaborator = Pick<Collab, "trade" | "brings" | "aliciaBrings"> & {
  menu?: DrinkMenu;
};

/* keyed by the "collab with" name, lowercased with only letters and digits */
export const COLLABORATORS: Record<string, Collaborator> = {
  "333matcha": {
    trade: "a matcha bar",
    brings: "a matcha drink for every seat, made to order",
    aliciaBrings: "the clay, the tools and the firing",
    menu: MENU_333,
  },
};

const keyOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
export const collaborator = (name: string) => COLLABORATORS[keyOf(name)];

/* the collab card's words for a collaborator we know — nothing otherwise */
export function collabDetails(name: string) {
  const c = collaborator(name);
  return c
    ? { trade: c.trade, brings: c.brings, aliciaBrings: c.aliciaBrings }
    : {};
}

export const menuFor = (e: ClassEvent) =>
  (e.collab && collaborator(e.collab.with)?.menu) || null;

/* ── one seat's drink ─────────────────────────────────────────────── */

export const isPlain = (m: DrinkMenu, drinkId?: string) =>
  !!m.drinks.find((d) => d.id === drinkId)?.plain;

export const newDraft = (m: DrinkMenu): DrinkDraft => ({
  milk: m.milks[0].id,
  syrup: null,
});

export const isChosen = (d: DrinkDraft): d is DrinkPick =>
  !!d.drink && !!d.temp;

/* "iced honey, i'm home matcha · oat milk" */
export function drinkLabel(m: DrinkMenu, d: DrinkPick) {
  const drink = m.drinks.find((x) => x.id === d.drink)!;
  const name = drink.plain ? drink.name : `${drink.name} matcha`;
  const syrupName = drink.plain
    ? m.syrups.find((x) => x.id === d.syrup)?.name
    : undefined;
  return [
    `${d.temp} ${name}`,
    m.milks.find((x) => x.id === d.milk)!.name,
    syrupName && `${syrupName} syrup`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/* ── in links: "honey-im-home.iced.oat." one per seat, comma-joined ── */

export const encodeDrinks = (ds: readonly DrinkPick[]) =>
  ds.map((d) => [d.drink, d.temp, d.milk, d.syrup ?? ""].join(".")).join(",");

/*
 * The drinks a booking names, one per seat, every choice on the menu; a
 * syrup only on the plain drink. Anything else is null.
 */
export function parseDrinks(
  m: DrinkMenu,
  raw: string | undefined,
  seats: number,
): DrinkPick[] | null {
  const parts = (raw ?? "").split(",");
  if (!raw || parts.length !== seats) return null;
  const out: DrinkPick[] = [];
  for (const part of parts) {
    const [drink, temp, milk, syrupId] = part.split(".");
    const plain = isPlain(m, drink);
    if (
      !m.drinks.some((x) => x.id === drink) ||
      !TEMPS.includes(temp as Temp) ||
      !m.milks.some((x) => x.id === milk) ||
      (syrupId && (!plain || !m.syrups.some((x) => x.id === syrupId)))
    ) {
      return null;
    }
    out.push({ drink, temp: temp as Temp, milk, syrup: syrupId || null });
  }
  return out;
}

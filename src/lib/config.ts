export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ??
  "https://qbqkeoda0hejfzhl.public.blob.vercel-storage.com";

export const BYPASS_COOKIE = "gate_bypass";

// Closes the shop while stock/inventory is reworked: "/" shows the
// "exciting things coming" page and shop/cart routes redirect to it.
// The ?bypass=<GATE_BYPASS_KEY> cookie still gets through for previewing.
export const SHOP_CLOSED = true;

// Square categories that decide what the shop lists. Categories, not sales
// channels, because channels are read-only through the API and items are added
// both in the Square Dashboard and through the API. Matched by name,
// case-insensitively.
// - online shop: listed in the shop. An item must be in it to show at all, so
//   anything untagged (bookkeeping entries, half-set-up items) stays hidden.
// - market only: in stock for markets, not sold online. Wins over online shop.
// - events: ticketed events (Scheduled / Collab), listed on their own page.
export const ONLINE_SHOP_CATEGORY_NAME = "online shop";
export const MARKET_ONLY_CATEGORY_NAME = "market only";
export const EVENTS_CATEGORY_NAME = "events";

export const SITE = {
  name: "aliciapceramics",
  estYear: "2024",
  instagram: "aliciapceramics",
  studio: {
    address: "1300 South Polk St. unit 287, Dallas TX 75224",
  },
};

export const DROP = {
  name: "Made of Earth, Full of His spirit",
  description: "made of earth, full of His spirit.",
  opensAt: "2026-05-30T09:00:00-05:00", // 9am CDT (Dallas)
};

export const PICKUP_NOTE = "i'll coordinate with you";

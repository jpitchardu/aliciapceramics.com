export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ??
  "https://qbqkeoda0hejfzhl.public.blob.vercel-storage.com";

export const BYPASS_COOKIE = "gate_bypass";

// Closes the shop while stock/inventory is reworked: "/" shows the
// "exciting things coming" page and shop/cart routes redirect to it.
// The ?bypass=<GATE_BYPASS_KEY> cookie still gets through for previewing.
export const SHOP_CLOSED = true;

// Square categories that keep an item out of the shop. Categories, not sales
// channels, because channels are read-only through the API and items are added
// both in the Square Dashboard and through the API. Matched by name,
// case-insensitively.
// - market only: pieces in stock for markets but not sold online
// - events: ticketed events (Scheduled / Collab), listed on their own page
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

export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ??
  "https://qbqkeoda0hejfzhl.public.blob.vercel-storage.com";

export const BYPASS_COOKIE = "gate_bypass";

// Closes the shop while stock/inventory is reworked: "/" shows the
// "exciting things coming" page and shop/cart routes redirect to it.
// The ?bypass=<GATE_BYPASS_KEY> cookie still gets through for previewing.
export const SHOP_CLOSED = true;

// Square category that marks ticketed events (Scheduled / Collab). Items in
// it never appear in the shop, whatever their sales channels. Matched by
// name, case-insensitively, so it can be created in the Square Dashboard.
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

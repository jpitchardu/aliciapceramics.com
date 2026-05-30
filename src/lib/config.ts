export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ??
  "https://qbqkeoda0hejfzhl.public.blob.vercel-storage.com";

export const BYPASS_COOKIE = "gate_bypass";

export const SITE = {
  name: "aliciapceramics",
  estYear: "2024",
  studio: {
    address: "47 india street, greenpoint",
  },
  instagram: "aliciapceramics",
};

export const DROP = {
  name: "creating spring",
  date: "jun 2026",
  subtitle: "revelations of creation.",
  description: "made of earth, full of His spirit.",
  opensAt: "2026-05-30T09:00:00-05:00", // 9am CDT (Dallas)
};

export const SHIPPING_COST_CENTS = 1200;

export const PICKUP_SLOTS = [
  { day: "wed", date: "jun 18", window: "2 – 5 pm" },
  { day: "sat", date: "jun 21", window: "11 am – 3 pm" },
  { day: "wed", date: "jun 25", window: "2 – 5 pm" },
  { day: "sat", date: "jun 28", window: "11 am – 3 pm" },
];

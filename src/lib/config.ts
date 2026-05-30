export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ??
  "https://qbqkeoda0hejfzhl.public.blob.vercel-storage.com";

export const BYPASS_COOKIE = "gate_bypass";

export const SITE = {
  name: "aliciapceramics",
  estYear: "2024",
  instagram: "aliciapceramics",
  studio: {
    address: "1300 South Polk St. unit 287, Dallas TX 75224",
  },
};

export const DROP = {
  name: "creating spring",
  date: "jun 2026",
  subtitle: "revelations of creation.",
  description: "made of earth, full of His spirit.",
  opensAt: "2026-05-30T09:00:00-05:00", // 9am CDT (Dallas)
};

export const PICKUP_SLOTS = [
  { day: "wed", date: "jun 3", window: "3 – 5 pm" },
  { day: "thu", date: "jun 4", window: "10 am – 2 pm" },
  { day: "fri", date: "jun 5", window: "10 am – 2 pm" },
  { day: "other", date: "", window: "i'll text you to coordinate" },
];

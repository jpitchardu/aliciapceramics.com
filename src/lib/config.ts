export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ??
  "https://qbqkeoda0hejfzhl.public.blob.vercel-storage.com";

export const SITE = {
  name: "aliciapceramics",
  city: "brooklyn",
  estYear: "2024",
  studio: {
    address: "47 india street, greenpoint",
    city: "brooklyn",
  },
  instagram: "aliciapceramics",
};

export const DROP = {
  name: "creating spring",
  date: "jun 2026",
  subtitle: "the warm rooms of a slow morning.",
  description: "made of earth, full of His spirit.",
  opensAt: "2026-05-30T09:00:00-06:00", // 9am CST
};

export const PICKUP_SLOTS = [
  { day: "wed", date: "jun 18", window: "2 – 5 pm" },
  { day: "sat", date: "jun 21", window: "11 am – 3 pm" },
  { day: "wed", date: "jun 25", window: "2 – 5 pm" },
  { day: "sat", date: "jun 28", window: "11 am – 3 pm" },
];

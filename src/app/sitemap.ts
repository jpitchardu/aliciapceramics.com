import { MetadataRoute } from "next";
import { fetchAllPieces } from "@/lib/square";

const BASE_URL = "https://aliciapceramics.com";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pieces = await fetchAllPieces();

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...pieces.map((piece) => ({
      url: `${BASE_URL}/shop/${piece.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}

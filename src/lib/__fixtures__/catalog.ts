import type { Piece } from "@/types/piece";
import type { Category } from "@/lib/square";

const PH = "/assets/photo-placeholder.png";

export const FIXTURE_CATEGORIES: Category[] = [
  { id: "7MBVR3HSSRBSXYNC5GS6WCJ3", name: "cups" },
  { id: "DLWWZFQLXFYHZZKMICVWAYF6", name: "bowls" },
];

export const FIXTURE_PIECES: Piece[] = [
  {
    id: "MDCV2BMWYMDYJO6DMQKNS2HA",
    n: "2/3",
    title: '"Look" 12oz Cup',
    note: 'Inspired by the sunsets that are painted for us to behold. Every day I point to the sky and say to my husband, "Look."',
    glaze: "a mix of washed pink, baby blue & a curry yellow glaze",
    dim: 'approx. 3.5" h x 3" w',
    price: 40,
    state: "here",
    srcs: [PH, PH, PH],
    collections: ["7MBVR3HSSRBSXYNC5GS6WCJ3", "DLWWZFQLXFYHZZKMICVWAYF6"],
  },
  {
    id: "FIXTURE_CUP_001",
    n: "1/1",
    title: "Morning Cup",
    note: "Hand built, dipped twice in cobalt. The handle sits just right.",
    glaze: "cobalt slip · clear",
    dim: '3" h x 2.75" w',
    price: 48,
    state: "here",
    srcs: [PH, PH],
    collections: ["7MBVR3HSSRBSXYNC5GS6WCJ3"],
  },
  {
    id: "FIXTURE_CUP_002",
    n: "3/3",
    title: "Blush Tumbler",
    note: "No handle. Holds a glass of wine or a slow morning coffee.",
    glaze: "blush matte",
    dim: '4" h x 2.5" w',
    price: 38,
    state: "gone",
    srcs: [PH],
    collections: ["7MBVR3HSSRBSXYNC5GS6WCJ3"],
  },
  {
    id: "FIXTURE_BOWL_001",
    n: "1/2",
    title: "Sunday Bowl",
    note: "Wide enough for one salad or two soups.",
    glaze: "olive ash",
    dim: '3" h x 6" w',
    price: 62,
    state: "here",
    srcs: [PH, PH],
    collections: ["DLWWZFQLXFYHZZKMICVWAYF6"],
  },
  {
    id: "FIXTURE_BOWL_002",
    n: "2/2",
    title: "Low Pinch Bowl",
    note: "Pinched, not thrown. A small ridge on one side where my thumb sat.",
    glaze: "oat satin",
    dim: '2" h x 5" w',
    price: 52,
    state: "here",
    srcs: [PH, PH, PH],
    collections: ["DLWWZFQLXFYHZZKMICVWAYF6"],
  },
  {
    id: "FIXTURE_BOWL_003",
    n: "1/1",
    title: "Deep Blue Tea Bowl",
    note: "Wider than the mug, no handle — for the way you hold a bowl in cold weather.",
    glaze: "cobalt slip",
    dim: '2.5" h x 4.5" w',
    price: 58,
    state: "here",
    srcs: [PH],
    collections: ["DLWWZFQLXFYHZZKMICVWAYF6"],
  },
];

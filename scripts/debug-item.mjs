import { SquareClient, SquareEnvironment } from "square";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const eq = l.indexOf("=");
      return [l.slice(0, eq), l.slice(eq + 1).replace(/^"|"$/g, "")];
    }),
);

const client = new SquareClient({
  token: env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Production,
});

// Fetch a single item directly by ID to see its full raw shape
const res = await client.catalog.object.get({
  objectId: "MDCV2BMWYMDYJO6DMQKNS2HA", // "Look" 12oz Cup
  includeRelatedObjects: true,
});

console.log(JSON.stringify(res, (_, v) => typeof v === "bigint" ? v.toString() : v, 2));

import { createHmac } from "crypto";

const PATH = "/api/webhooks/square";

/*
 * Square signs the notification URL exactly as it's registered, and the bare
 * domain redirects to www — so the URL Square signed may not be
 * NEXT_PUBLIC_SITE_URL's. Accept a signature for either host.
 */
export function webhookUrls(siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "") {
  const urls = new Set<string>();
  try {
    const { protocol, host } = new URL(siteUrl);
    const bare = host.replace(/^www\./, "");
    urls.add(`${protocol}//${bare}${PATH}`);
    urls.add(`${protocol}//www.${bare}${PATH}`);
  } catch {
    // no site url set — nothing can verify
  }
  return [...urls];
}

export function verifySignature(
  rawBody: string,
  signature: string | null,
  key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ?? "",
  urls = webhookUrls(),
): boolean {
  if (!signature || !key) return false;
  return urls.some(
    (url) =>
      createHmac("sha256", key)
        .update(url + rawBody)
        .digest("base64") === signature,
  );
}

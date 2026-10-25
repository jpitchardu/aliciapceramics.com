import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifySignature, webhookUrls } from "@/lib/square-webhook";

const KEY = "test-signature-key";
const body = JSON.stringify({ type: "order.updated" });
// how Square signs: HMAC-SHA256 of the registered URL + the raw body
const sign = (url: string) =>
  createHmac("sha256", KEY)
    .update(url + body)
    .digest("base64");

describe("webhookUrls", () => {
  it("covers the bare domain and www, whichever the site url is", () => {
    const both = [
      "https://aliciapceramics.com/api/webhooks/square",
      "https://www.aliciapceramics.com/api/webhooks/square",
    ];
    expect(webhookUrls("https://aliciapceramics.com")).toEqual(both);
    expect(webhookUrls("https://www.aliciapceramics.com")).toEqual(both);
  });

  it("is empty without a site url", () => {
    expect(webhookUrls("")).toEqual([]);
  });
});

describe("verifySignature", () => {
  const urls = webhookUrls("https://aliciapceramics.com");

  it("accepts a signature made for the www url", () => {
    // the bare domain redirects to www, so that's what Square can reach
    const sig = sign("https://www.aliciapceramics.com/api/webhooks/square");
    expect(verifySignature(body, sig, KEY, urls)).toBe(true);
  });

  it("accepts a signature made for the bare url", () => {
    const sig = sign("https://aliciapceramics.com/api/webhooks/square");
    expect(verifySignature(body, sig, KEY, urls)).toBe(true);
  });

  it("rejects a signature for another url, a changed body or no key", () => {
    expect(
      verifySignature(
        body,
        sign("https://evil.example/api/webhooks/square"),
        KEY,
        urls,
      ),
    ).toBe(false);
    const sig = sign("https://www.aliciapceramics.com/api/webhooks/square");
    expect(verifySignature(body + " ", sig, KEY, urls)).toBe(false);
    expect(verifySignature(body, sig, "", urls)).toBe(false);
    expect(verifySignature(body, null, KEY, urls)).toBe(false);
  });
});

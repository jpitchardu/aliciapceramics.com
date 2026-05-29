import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
});

const errorResponseBody = JSON.stringify({
  error: "Rate limit exceeded",
  message: "Too many requests, Please try again later.",
});

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    console.log("skipping rate limiting for non api route");
    return NextResponse.next();
  }

  console.log("starting rate limiting check");

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const ip =
    forwardedFor?.split(",")[0]?.trim() ??
    realIp ??
    request.nextUrl.hostname ??
    "unknown";

  try {
    const { success, limit, reset, remaining } = await rateLimit.limit(ip);

    const response = success
      ? NextResponse.next()
      : new NextResponse(errorResponseBody, { status: 429 });

    response.headers.set("Content-Type", "application/json");
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(reset).toString());
    response.headers.set(
      "Retry-after",
      Math.ceil((reset - Date.now()) / 1000).toString(),
    );

    if (!success) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
    }

    return response;
  } catch (err) {
    console.error("Rate limiting error", err);

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/:path*"],
};

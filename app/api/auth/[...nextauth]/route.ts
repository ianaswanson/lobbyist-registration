import { handlers } from "@/lib/auth";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

// Export GET handler directly from handlers
export const GET = handlers.GET;

// Wrap POST handler with rate limiting for login attempts
const originalPOST = handlers.POST;

export async function POST(req: NextRequest, context: any) {
  // Only rate limit sign-in attempts (not other auth operations)
  const url = new URL(req.url);
  if (url.pathname.includes("callback/credentials")) {
    // SECURITY: Rate limit login attempts - 5 per minute per IP
    const identifier = getClientIdentifier(req);
    const limitResult = rateLimit(identifier, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 5, // 5 attempts per minute
    });

    if (!limitResult.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfter: limitResult.reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (limitResult.reset.getTime() - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": limitResult.limit.toString(),
            "X-RateLimit-Remaining": limitResult.remaining.toString(),
            "X-RateLimit-Reset": limitResult.reset.toISOString(),
          },
        }
      );
    }
  }

  return originalPOST(req, context);
}

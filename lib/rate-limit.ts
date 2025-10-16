/**
 * Rate Limiting Utility
 * Prevents brute force attacks by limiting request frequency
 */

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// TODO: For production with multiple instances, use Redis or similar
const rateLimitMap = new Map<string, RateLimitStore>()

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

/**
 * Rate limiter function
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with limit status
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5, // 5 requests per minute
  }
) {
  const now = Date.now()
  const tokenData = rateLimitMap.get(identifier)

  // If no existing data or window expired, create new entry
  if (!tokenData || now > tokenData.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    })

    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: new Date(now + config.interval),
    }
  }

  // Increment count if within window
  tokenData.count++

  // Check if limit exceeded
  if (tokenData.count > config.uniqueTokenPerInterval) {
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: new Date(tokenData.resetTime),
    }
  }

  // Within limit
  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - tokenData.count,
    reset: new Date(tokenData.resetTime),
  }
}

/**
 * Get client identifier from request
 * Uses IP address as identifier
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (when behind proxy/CDN)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback to a default (not ideal, but better than nothing)
  return "unknown"
}

/**
 * Clean up old entries from rate limit map
 * Call this periodically to prevent memory leaks
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

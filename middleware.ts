import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/error",
    "/search", // Public search interface
    "/view", // Public data viewing
  ]

  // API routes that should be public
  const publicApiRoutes = ["/api/auth"]

  // Check if current path is public
  const isPublicRoute =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    publicApiRoutes.some((route) => pathname.startsWith(route))

  // Create response based on auth status
  let response: NextResponse

  // Allow public routes
  if (isPublicRoute) {
    response = NextResponse.next()
  }
  // Redirect to signin if not authenticated
  else if (!isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    response = NextResponse.redirect(signInUrl)
  }
  else {
    response = NextResponse.next()
  }

  // SECURITY: Add comprehensive HTTP security headers
  const headers = response.headers

  // Prevent clickjacking attacks
  headers.set("X-Frame-Options", "DENY")

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff")

  // Enable XSS protection (for older browsers)
  headers.set("X-XSS-Protection", "1; mode=block")

  // Referrer policy - only send origin on cross-origin requests
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Permissions policy - restrict dangerous features
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )

  // Content Security Policy - strict policy for government app
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-* needed for Next.js dev/hydration
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ]
  headers.set("Content-Security-Policy", cspDirectives.join("; "))

  // HTTPS enforcement - only allow secure connections
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    )
  }

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

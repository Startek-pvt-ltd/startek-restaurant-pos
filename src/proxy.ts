import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Netlify runs Next.js Proxy in an Edge Function. Never import @/auth here:
// its database-backed session callback pulls Prisma and pg into the Edge bundle.
// This is an early cryptographic session check only. Node routes/layouts still
// use auth()/requireAuth() to verify current user status and sessionVersion.
export async function proxy(request: NextRequest) {
  // Let the Node-rendered login page validate database-backed session state.
  // Redirecting a merely signed but revoked session here would create a loop.
  if (request.nextUrl.pathname === "/login") return NextResponse.next();

  let validSession = false;
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: request.nextUrl.protocol === "https:",
    });
    validSession =
      Boolean(token?.sub) &&
      typeof token?.sessionExpiresAt === "number" &&
      token.sessionExpiresAt > Date.now();
  } catch {
    // Missing/malformed secrets, cookies, or JWTs fail closed.
  }

  if (validSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/menu/:path*",
    "/pos/:path*",
    "/orders/:path*",
    "/reports/:path*",
    "/expenses/:path*",
    "/staff/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/system-status/:path*",
  ],
};

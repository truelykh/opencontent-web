import { NextRequest, NextResponse } from "next/server";

const ACCOUNT_COOKIE = "openconnect_account";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

/**
 * Issues a stable anonymous account identifier before the app loads.
 * This prevents concurrent first requests from creating separate accounts.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.get(ACCOUNT_COOKIE)?.value) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(ACCOUNT_COOKIE, crypto.randomUUID(), COOKIE_OPTIONS);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.svg|apple-touch-icon.png|legal-first-technical-spec.md).*)",
  ],
};

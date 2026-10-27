import type { NextRequest, NextResponse } from "next/server";
import { AccountRecord, createAccount, findAccount } from "./identity";

const ACCOUNT_COOKIE = "openconnect_account";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ResolvedAccount {
  account: AccountRecord;
  isNew: boolean;
}

/** Resolves the anonymous account cookie or creates a new account. */
export async function resolveAccount(
  request: NextRequest
): Promise<ResolvedAccount> {
  const cookieId = request.cookies.get(ACCOUNT_COOKIE)?.value;
  if (cookieId && UUID_PATTERN.test(cookieId)) {
    const existing = await findAccount(cookieId);
    if (existing) return { account: existing, isNew: false };
    // The middleware issued this ID before the account row existed.
    return { account: await createAccount(cookieId), isNew: false };
  }
  return { account: await createAccount(), isNew: true };
}

export function attachAccountCookie(
  response: NextResponse,
  accountId: string
): NextResponse {
  response.cookies.set(ACCOUNT_COOKIE, accountId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export function clearAccountCookie(response: NextResponse): NextResponse {
  response.cookies.set(ACCOUNT_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

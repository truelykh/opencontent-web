import { randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { attachAccountCookie } from "./accounts";
import {
  AccountRecord,
  hashPublicId,
  setAccountHash,
} from "./identity";
import { serviceUrl } from "../services/config";

const SIGNIN_SERVICE_URL = serviceUrl("signin");
function signinHeaders(contentType = false): Headers {
  const token = process.env.INTERNAL_AUTH_TOKEN;
  if (!token) throw new Error("Signin internal service token is not configured");
  const headers = new Headers({ "X-OpenContent-Service-Token": token });
  if (contentType) headers.set("Content-Type", "application/json");
  return headers;
}

export const SESSION_COOKIE = "openconnect_session";
export const SESSION_TTL_HOURS = 24;

export interface ActiveSession {
  id: string;
  accountId: string;
  userId: string;
  sessionHash: string;
  startedAt: string;
  expiresAt: string;
}

/** Creates a new session through the authoritative Signin service. */
export async function startSession(
  account: AccountRecord
): Promise<ActiveSession> {
  const nonce = randomBytes(24).toString("hex");
  const sessionHash = hashPublicId(account.publicId, account.salt, nonce);

  const response = await fetch(`${SIGNIN_SERVICE_URL}/session/start`, {
    method: "POST",
    headers: signinHeaders(true),
    body: JSON.stringify({
      accountId: account.id,
      userId: account.publicId,
      sessionHash,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(1000),
  });
  if (!response.ok) {
    throw new Error(`Signin service rejected session creation (${response.status})`);
  }
  const sess = (await response.json()) as ActiveSession;
  await setAccountHash(account.id, sessionHash);
  return sess;
}

export async function getActiveSession(
  request: NextRequest
): Promise<ActiveSession | null> {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const response = await fetch(
      `${SIGNIN_SERVICE_URL}/session/active?session_id=${encodeURIComponent(raw)}`,
      { headers: signinHeaders(), cache: "no-store", signal: AbortSignal.timeout(1000) }
    );
    return response.ok ? (await response.json()) as ActiveSession : null;
  } catch {
    return null;
  }
}

export async function endSession(sessionId: string): Promise<void> {
  const response = await fetch(`${SIGNIN_SERVICE_URL}/session/end`, {
    method: "POST",
    headers: signinHeaders(true),
    body: JSON.stringify({ sessionId }),
    cache: "no-store",
    signal: AbortSignal.timeout(1000),
  });
  if (!response.ok) {
    throw new Error(`Signin service rejected session logout (${response.status})`);
  }
}

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_HOURS * 60 * 60,
};

export function attachSessionCookie(
  response: NextResponse,
  sessionId: string
): NextResponse {
  response.cookies.set(SESSION_COOKIE, sessionId, SESSION_COOKIE_OPTIONS);
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, "", {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}

export function attachAuthCookies(
  response: NextResponse,
  accountId: string,
  sessionId: string
): NextResponse {
  attachAccountCookie(response, accountId);
  attachSessionCookie(response, sessionId);
  return response;
}

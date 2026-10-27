import { serviceUrl } from "../services/config";

const SIGNIN_SERVICE_URL = serviceUrl("signin");
function signinHeaders(contentType = false): Headers {
  const token = process.env.INTERNAL_AUTH_TOKEN;
  if (!token) throw new Error("Signin internal service token is not configured");
  const headers = new Headers({ "X-OpenContent-Service-Token": token });
  if (contentType) headers.set("Content-Type", "application/json");
  return headers;
}

export interface SessionSignalInput {
  countryCode: string | null;
  timezone: string | null;
  deviceClass: string | null;
  browser: string | null;
  botScore: number | null;
  botVerdict: string | null;
}

export interface SessionRowView {
  id: string;
  accountId: string;
  userId: string;
  sessionHash: string;
  signedIn: boolean;
  startedAt: string;
  expiresAt: string;
  endedAt: string | null;
  lastSeenAt: string | null;
  countryCode: string | null;
  timezone: string | null;
  deviceClass: string | null;
  browser: string | null;
  botScore: number | null;
  botVerdict: string | null;
}

export async function updateSessionSignals(
  sessionId: string,
  input: SessionSignalInput
): Promise<SessionRowView | null> {
  const response = await fetch(`${SIGNIN_SERVICE_URL}/session/signals`, {
    method: "POST",
    headers: signinHeaders(true),
    body: JSON.stringify({
      sessionId,
      countryCode: input.countryCode,
      timezone: input.timezone,
      deviceClass: input.deviceClass,
      browser: input.browser,
      botScore: input.botScore,
      botVerdict: input.botVerdict,
    }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as SessionRowView;
}

export async function getSessionById(
  sessionId: string
): Promise<SessionRowView | null> {
  const response = await fetch(
    `${SIGNIN_SERVICE_URL}/session/active?session_id=${encodeURIComponent(sessionId)}`,
    { headers: signinHeaders(), cache: "no-store" }
  );
  if (response.status === 404 || !response.ok) return null;
  return (await response.json()) as SessionRowView;
}

export async function getSessionStats(accountId: string): Promise<{
  total: number;
  active: number;
  lastRecordedAt: string | null;
}> {
  const response = await fetch(
    `${SIGNIN_SERVICE_URL}/session/stats?account_id=${encodeURIComponent(accountId)}`,
    { headers: signinHeaders(), cache: "no-store" }
  );
  if (!response.ok) {
    return { total: 0, active: 0, lastRecordedAt: null };
  }
  return (await response.json()) as {
    total: number;
    active: number;
    lastRecordedAt: string | null;
  };
}

export async function getRecentSessions(
  accountId: string,
  limit = 5
): Promise<SessionRowView[]> {
  const response = await fetch(
    `${SIGNIN_SERVICE_URL}/session/recent?account_id=${encodeURIComponent(accountId)}&limit=${limit}`,
    { headers: signinHeaders(), cache: "no-store" }
  );
  if (!response.ok) return [];
  return (await response.json()) as SessionRowView[];
}

export async function deleteSessionsPermanently(accountId: string): Promise<void> {
  const response = await fetch(
    `${SIGNIN_SERVICE_URL}/session/purge?account_id=${encodeURIComponent(accountId)}`,
    { method: "DELETE", headers: signinHeaders(), cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error(`Session service failed to purge sessions: ${response.statusText}`);
  }
}

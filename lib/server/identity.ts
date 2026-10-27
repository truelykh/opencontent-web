import { createHash } from "node:crypto";
import { serviceUrl } from "../services/config";

const AUTH_SERVICE_URL = serviceUrl("auth");
function authHeaders(contentType = false): Headers {
  const token = process.env.INTERNAL_AUTH_TOKEN;
  if (!token) throw new Error("Auth internal service token is not configured");
  const headers = new Headers({ "X-OpenContent-Service-Token": token });
  if (contentType) headers.set("Content-Type", "application/json");
  return headers;
}

// Must stay byte-for-byte aligned with features/auth.PublicIDAlphabet.
export const PUBLIC_ID_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
export const PUBLIC_ID_LENGTH = 7;
export const USER_ID_TTL_DAYS = 180;

export interface AccountRecord {
  id: string;
  publicId: string;
  hash: string;
  salt: string;
  createdAt: string;
  userIdIssuedAt: string;
  userIdExpiresAt: string;
  userIdDaysRemaining: number;
  userIdExpired: boolean;
}

export function generateRandomPublicId(): string {
  let result = "";
  for (let i = 0; i < PUBLIC_ID_LENGTH; i++) {
    result += PUBLIC_ID_ALPHABET[Math.floor(Math.random() * PUBLIC_ID_ALPHABET.length)];
  }
  return result;
}

export function hashPublicId(
  publicId: string,
  salt: string,
  nonce?: string
): string {
  return createHash("sha256")
    .update(nonce ? `${salt}:${publicId}:${nonce}` : `${salt}:${publicId}`)
    .digest("hex");
}

export async function createAccount(accountId?: string): Promise<AccountRecord> {
  const response = await fetch(`${AUTH_SERVICE_URL}/identity/new`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ accountId: accountId ?? "" }),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) {
    throw new Error(`Identity service failed to create account: ${response.statusText}`);
  }
  return (await response.json()) as AccountRecord;
}

export async function findAccount(id: string): Promise<AccountRecord | null> {
  const response = await fetch(
    `${AUTH_SERVICE_URL}/identity/account?id=${encodeURIComponent(id)}`,
    { headers: authHeaders(), cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Identity service failed to find account: ${response.statusText}`);
  }
  return (await response.json()) as AccountRecord;
}

export async function findAccountByPublicId(
  publicId: string
): Promise<AccountRecord | null> {
  const normId = publicId.trim().toLowerCase();
  const response = await fetch(
    `${AUTH_SERVICE_URL}/identity/by-public-id?public_id=${encodeURIComponent(normId)}`,
    { headers: authHeaders(), cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Identity service failed to find account by public ID: ${response.statusText}`);
  }
  return (await response.json()) as AccountRecord;
}

export async function rotateAccount(id: string): Promise<AccountRecord> {
  const response = await fetch(`${AUTH_SERVICE_URL}/identity/rotate`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ accountId: id }),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) {
    throw new Error(`Identity service failed to rotate account: ${response.statusText}`);
  }
  return (await response.json()) as AccountRecord;
}

export async function setAccountHash(id: string, hash: string): Promise<void> {
  const response = await fetch(`${AUTH_SERVICE_URL}/identity/hash`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ accountId: id, hash }),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) {
    throw new Error(`Identity service failed to set account hash: ${response.statusText}`);
  }
}

export async function deleteAccountPermanently(accountId: string): Promise<void> {
  const response = await fetch(
    `${AUTH_SERVICE_URL}/identity/account?id=${encodeURIComponent(accountId)}`,
    { method: "DELETE", headers: authHeaders(), cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(`Identity service failed to delete account: ${response.statusText}`);
  }
}

export interface IssuedUserIdRecord {
  userId: string;
  accountId: string;
  issuedAt: string;
  retiredAt: string | null;
}

export async function findIssuedUserId(
  userId: string
): Promise<IssuedUserIdRecord | null> {
  const normId = userId.trim().toLowerCase();
  const response = await fetch(
    `${AUTH_SERVICE_URL}/identity/issued-user-id?user_id=${encodeURIComponent(normId)}`,
    { headers: authHeaders(), cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Identity service failed to find issued user ID: ${response.statusText}`);
  }
  return (await response.json()) as IssuedUserIdRecord;
}

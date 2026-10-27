import { serviceUrl } from "../services/config";

const PROFILE_SERVICE_URL = serviceUrl("profile");

function profileHeaders(headers: HeadersInit = {}): Headers {
  const token = process.env.INTERNAL_AUTH_TOKEN;
  if (!token) throw new Error("Profile internal service token is not configured");
  const result = new Headers(headers);
  result.set("X-OpenContent-Service-Token", token);
  return result;
}

export interface ProfileRecord {
  accountId: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInput {
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
}

export interface AvatarMedia {
  id: string;
  accountId: string;
  mimeType: string;
  byteSize: number;
  bytes: Buffer;
}

export async function ensureProfile(accountId: string): Promise<ProfileRecord> {
  return getProfile(accountId);
}

export async function getProfile(accountId: string): Promise<ProfileRecord> {
  const response = await fetch(
    `${PROFILE_SERVICE_URL}/profile?account_id=${encodeURIComponent(accountId)}`,
    { headers: profileHeaders(), cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (response.ok) {
    return (await response.json()) as ProfileRecord;
  }
  throw new Error(`Profile service failed to get profile: ${response.statusText}`);
}

export async function updateProfile(
  accountId: string,
  input: ProfileInput
): Promise<ProfileRecord> {
  const response = await fetch(`${PROFILE_SERVICE_URL}/profile`, {
    method: "PUT",
    headers: profileHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      accountId,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: input.displayName,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (response.ok) {
    return (await response.json()) as ProfileRecord;
  }
  throw new Error(`Profile service failed to update profile: ${response.statusText}`);
}

export async function saveAvatar(
  accountId: string,
  bytes: Buffer,
  mimeType: string
): Promise<ProfileRecord> {
  const formData = new FormData();
  formData.append("accountId", accountId);
  formData.append(
    "avatar",
    new Blob([bytes as unknown as BlobPart], { type: mimeType }),
    "avatar"
  );

  const response = await fetch(`${PROFILE_SERVICE_URL}/profile/avatar`, {
    method: "POST",
    headers: profileHeaders(), body: formData,
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Profile service failed to save avatar: ${response.statusText}`);
  }
  return (await response.json()) as ProfileRecord;
}

export async function removeAvatar(accountId: string): Promise<ProfileRecord> {
  const response = await fetch(
    `${PROFILE_SERVICE_URL}/profile/avatar?account_id=${encodeURIComponent(accountId)}`,
    { method: "DELETE", headers: profileHeaders(), cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (!response.ok) {
    throw new Error(`Profile service failed to remove avatar: ${response.statusText}`);
  }
  return (await response.json()) as ProfileRecord;
}

export async function clearProfile(accountId: string): Promise<ProfileRecord> {
  const response = await fetch(
    `${PROFILE_SERVICE_URL}/profile?account_id=${encodeURIComponent(accountId)}`,
    { method: "DELETE", headers: profileHeaders(), cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (!response.ok) {
    throw new Error(`Profile service failed to clear profile: ${response.statusText}`);
  }
  return (await response.json()) as ProfileRecord;
}

export async function getAvatarMedia(id: string): Promise<AvatarMedia | null> {
  const response = await fetch(
    `${PROFILE_SERVICE_URL}/profile/avatar/${encodeURIComponent(id)}`,
    { cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Profile service failed to get avatar: ${response.statusText}`);
  }
  const mimeType = response.headers.get("Content-Type") || "application/octet-stream";
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return {
    id,
    accountId: "",
    mimeType,
    byteSize: buffer.length,
    bytes: buffer,
  };
}

export async function deleteProfilePermanently(accountId: string, userId: string): Promise<void> {
  const response = await fetch(
    `${PROFILE_SERVICE_URL}/profile/purge?account_id=${encodeURIComponent(accountId)}&user_id=${encodeURIComponent(userId)}`,
    { method: "DELETE", headers: profileHeaders(), cache: "no-store", signal: AbortSignal.timeout(4000) }
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(`Profile service failed to purge profile: ${response.statusText}`);
  }
}

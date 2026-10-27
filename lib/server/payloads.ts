import type { ActiveSession } from "./auth";
import type { AccountRecord } from "./identity";

export function publicAccount(account: AccountRecord) {
  return {
    publicId: account.publicId,
    createdAt: account.createdAt,
    userIdIssuedAt: account.userIdIssuedAt,
    userIdExpiresAt: account.userIdExpiresAt,
    userIdDaysRemaining: account.userIdDaysRemaining,
    userIdExpired: account.userIdExpired,
  };
}

export function publicSession(session: ActiveSession | null) {
  if (!session) return null;
  return {
    id: session.id,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
    userId: session.userId,
  };
}

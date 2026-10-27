import { NextRequest, NextResponse } from "next/server";
import {
  attachAccountCookie,
  clearAccountCookie,
  resolveAccount,
} from "../../../../lib/server/accounts";
import { clearSessionCookie, getActiveSession } from "../../../../lib/server/auth";
import { deleteAccountPermanently } from "../../../../lib/server/identity";
import {
  deleteProfilePermanently,
  ensureProfile,
} from "../../../../lib/server/profile";
import {
  deleteSessionsPermanently,
  getRecentSessions,
} from "../../../../lib/server/session";

export async function GET(request: NextRequest) {
  try {
    const { account, isNew } = await resolveAccount(request);
    const [profile, sessions] = await Promise.all([
      ensureProfile(account.id),
      getRecentSessions(account.id, 20),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      identity: {
        publicId: account.publicId,
        createdAt: account.createdAt,
      },
      profile,
      // Export only user-owned data. Internal hashes, session identifiers and
      // database topology are never part of a browser-downloadable payload.
      sessions: sessions.map((session) => ({
        id: session.id,
        userId: session.userId,
        signedIn: session.signedIn,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        endedAt: session.endedAt,
        lastSeenAt: session.lastSeenAt,
        countryCode: session.countryCode,
        timezone: session.timezone,
        deviceClass: session.deviceClass,
        browser: session.browser,
      })),
    };

    const response = NextResponse.json(payload, {
      headers: {
        "Content-Disposition": `attachment; filename="opencontent-profile-${account.publicId}.json"`,
      },
    });
    if (isNew) attachAccountCookie(response, account.id);
    return response;
  } catch (error) {
    console.error("GET /api/profile/export failed", error);
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getActiveSession(request);
    if (!session) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    const accountId = session.accountId;
    await deleteSessionsPermanently(accountId);
    await deleteProfilePermanently(accountId, session.userId);
    await deleteAccountPermanently(accountId);

    const response = NextResponse.json({ ok: true, deleted: true });
    clearAccountCookie(response);
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("DELETE /api/profile/data failed", error);
    return NextResponse.json(
      { error: "delete_failed", message: "Could not delete all data." },
      { status: 500 }
    );
  }
}

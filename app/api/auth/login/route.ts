import { NextRequest, NextResponse } from "next/server";
import { attachAuthCookies, endSession, getActiveSession, startSession } from "../../../../lib/server/auth";
import {
  findAccount,
  findAccountByPublicId,
  findIssuedUserId,
  rotateAccount,
} from "../../../../lib/server/identity";
import { ensureProfile } from "../../../../lib/server/profile";
import { publicAccount, publicSession } from "../../../../lib/server/payloads";

// Keep this in lockstep with the Auth service's PublicIDAlphabet.  IDs are
// stored lowercase and deliberately omit only ambiguous l and o characters.
const USER_ID_PATTERN = /^[abcdefghijkmnpqrstuvwxyz23456789]{7}$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { userId?: unknown }
      | null;
    const raw = typeof body?.userId === "string" ? body.userId : "";
    const userId = raw.trim().toLowerCase();

    if (!USER_ID_PATTERN.test(userId)) {
      return NextResponse.json(
        {
          error: "invalid_user_id",
          message: "Enter a valid 7-character user ID.",
        },
        { status: 400 }
      );
    }

    let account = await findAccountByPublicId(userId);
    if (!account) {
      const issued = await findIssuedUserId(userId);
      if (issued) {
        return NextResponse.json(
          {
            error: "user_id_retired",
            message:
              "This user ID has been retired and cannot be reused. Sign in with your current user ID.",
          },
          { status: 410 }
        );
      }
      return NextResponse.json(
        {
          error: "user_id_not_found",
          message: "That user ID does not exist.",
        },
        { status: 404 }
      );
    }

    // If the ID is older than 180 days, rotation is mandatory: rotate before
    // creating the new session and return the new ID so the user can save it.
    let rotated:
      | { previousUserId: string; newUserId: string }
      | null = null;
    if (account.userIdExpired) {
      const previousUserId = account.publicId;
      account = await rotateAccount(account.id);
      rotated = { previousUserId, newUserId: account.publicId };
    }

    // One active browser session at a time.
    const previousSession = await getActiveSession(request);
    if (previousSession) await endSession(previousSession.id);

    const session = await startSession(account);
    const freshAccount = (await findAccount(account.id)) ?? account;
    const profile = await ensureProfile(freshAccount.id);

    const response = NextResponse.json({
      signedIn: true,
      account: publicAccount(freshAccount),
      profile,
      session: publicSession(session),
      rotated,
    });
    attachAuthCookies(response, freshAccount.id, session.id);
    return response;
  } catch (error) {
    console.error("POST /api/auth/login failed", error);
    return NextResponse.json(
      { error: "login_failed", message: "Could not sign in." },
      { status: 500 }
    );
  }
}

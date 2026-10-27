import { NextRequest, NextResponse } from "next/server";
import {
  attachAuthCookies,
  endSession,
  getActiveSession,
  startSession,
} from "../../../../lib/server/auth";
import { createAccount, findAccount } from "../../../../lib/server/identity";
import { ensureProfile } from "../../../../lib/server/profile";
import { publicAccount, publicSession } from "../../../../lib/server/payloads";

/** Creates a brand-new account, reserves its user ID forever, and signs in. */
export async function POST(request: NextRequest) {
  try {
    const previousSession = await getActiveSession(request);
    if (previousSession) await endSession(previousSession.id);

    const created = await createAccount();
    const session = await startSession(created);
    const account = (await findAccount(created.id)) ?? created;
    const profile = await ensureProfile(account.id);

    const response = NextResponse.json({
      signedIn: true,
      created: true,
      account: publicAccount(account),
      profile,
      session: publicSession(session),
    });
    attachAuthCookies(response, account.id, session.id);
    return response;
  } catch (error) {
    console.error("POST /api/auth/new failed", error);
    return NextResponse.json(
      { error: "account_creation_failed", message: "Could not create a user ID." },
      { status: 500 }
    );
  }
}

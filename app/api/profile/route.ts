import { NextRequest, NextResponse } from "next/server";
import { attachAccountCookie, resolveAccount } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";
import {
  clearProfile,
  ensureProfile,
  updateProfile,
} from "../../../lib/server/profile";
import { publicAccount, publicSession } from "../../../lib/server/payloads";
import {
  ValidationError,
  optionalName,
} from "../../../lib/server/validation";

function payload(
  account: Parameters<typeof publicAccount>[0],
  profile: Awaited<ReturnType<typeof ensureProfile>>,
  signedIn: boolean,
  session: Awaited<ReturnType<typeof getActiveSession>>
) {
  return {
    account: publicAccount(account),
    profile,
    signedIn,
    session: signedIn ? publicSession(session) : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const active = await getActiveSession(request);
    if (!active) {
      return NextResponse.json({
        account: null,
        profile: null,
        signedIn: false,
        session: null,
      });
    }

    const { account, isNew } = await resolveAccount(request);
    const profile = await ensureProfile(account.id);
    const response = NextResponse.json(
      payload(account, profile, true, active)
    );
    if (isNew) attachAccountCookie(response, account.id);
    return response;
  } catch (error) {
    console.error("GET /api/profile failed", error);
    return NextResponse.json(
      { error: "profile_unavailable" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { account, isNew } = await resolveAccount(request);
    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    if (!body) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const input = {
      firstName: optionalName(body.firstName, "First name"),
      lastName: optionalName(body.lastName, "Last name"),
      displayName: optionalName(body.displayName, "Display name"),
    };

    await updateProfile(account.id, input);
    const [profile, active] = await Promise.all([
      ensureProfile(account.id),
      getActiveSession(request),
    ]);
    const signedIn = Boolean(active && active.accountId === account.id);
    const response = NextResponse.json(
      payload(account, profile, signedIn, active)
    );
    if (isNew) attachAccountCookie(response, account.id);
    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "validation_error", message: error.message },
        { status: error.status }
      );
    }
    console.error("PUT /api/profile failed", error);
    return NextResponse.json(
      { error: "profile_update_failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { account, isNew } = await resolveAccount(request);
    const [profile, active] = await Promise.all([
      clearProfile(account.id),
      getActiveSession(request),
    ]);
    const signedIn = Boolean(active && active.accountId === account.id);
    const response = NextResponse.json(
      payload(account, profile, signedIn, active)
    );
    if (isNew) attachAccountCookie(response, account.id);
    return response;
  } catch (error) {
    console.error("DELETE /api/profile failed", error);
    return NextResponse.json(
      { error: "profile_delete_failed" },
      { status: 500 }
    );
  }
}

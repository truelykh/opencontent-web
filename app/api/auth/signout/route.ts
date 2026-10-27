import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  endSession,
  getActiveSession,
} from "../../../../lib/server/auth";

export async function POST(request: NextRequest) {
  try {
    const active = await getActiveSession(request);
    if (active) await endSession(active.id);
    const response = NextResponse.json({ signedIn: false });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("POST /api/auth/logout failed", error);
    return NextResponse.json(
      { error: "logout_failed", message: "Could not end the session." },
      { status: 500 }
    );
  }
}

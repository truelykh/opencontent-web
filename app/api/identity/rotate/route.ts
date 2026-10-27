import { NextRequest, NextResponse } from "next/server";
import { attachAccountCookie, resolveAccount } from "../../../../lib/server/accounts";
import { publicAccount } from "../../../../lib/server/payloads";
import { rotateAccount } from "../../../../lib/server/identity";
import { getActiveSession } from "../../../../lib/server/auth";


export async function POST(request: NextRequest) {
  try {
    const { account, isNew } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const rotated = await rotateAccount(account.id);
    const response = NextResponse.json({
      account: publicAccount(rotated),
    });
    if (isNew) attachAccountCookie(response, account.id);
    return response;
  } catch (error) {
    console.error("POST /api/identity/rotate failed", error);
    return NextResponse.json(
      { error: "identity_rotation_failed" },
      { status: 500 }
    );
  }
}

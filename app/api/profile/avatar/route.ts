import { NextRequest, NextResponse } from "next/server";
import { attachAccountCookie, resolveAccount } from "../../../../lib/server/accounts";
import { getActiveSession } from "../../../../lib/server/auth";
import {
  ensureProfile,
  removeAvatar,
  saveAvatar,
} from "../../../../lib/server/profile";


const MAX_BYTES = 2 * 1024 * 1024;

function detectImageMime(buffer: Buffer): string | null {
  if (
    buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff &&
    buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 24 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) &&
    buffer.toString("ascii", 12, 16) === "IHDR" &&
    buffer.readUInt32BE(16) > 0 && buffer.readUInt32BE(20) > 0
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 16 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP" &&
    ["VP8 ", "VP8L", "VP8X"].includes(buffer.toString("ascii", 12, 16))
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { account, isNew } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const form = await request.formData();
    const file = form.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "avatar_required" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "avatar_empty" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "avatar_too_large", maxBytes: MAX_BYTES },
        { status: 413 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const detectedMime = detectImageMime(bytes);
    if (!detectedMime) {
      return NextResponse.json(
        { error: "avatar_unsupported_type" },
        { status: 415 }
      );
    }

    await ensureProfile(account.id);
    const profile = await saveAvatar(account.id, bytes, detectedMime);
    const response = NextResponse.json({ profile });
    if (isNew) attachAccountCookie(response, account.id);
    return response;
  } catch (error) {
    console.error("POST /api/profile/avatar failed", error);
    return NextResponse.json(
      { error: "avatar_upload_failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { account, isNew } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const profile = await removeAvatar(account.id);
    const response = NextResponse.json({ profile });
    if (isNew) attachAccountCookie(response, account.id);
    return response;
  } catch (error) {
    console.error("DELETE /api/profile/avatar failed", error);
    return NextResponse.json(
      { error: "avatar_remove_failed" },
      { status: 500 }
    );
  }
}

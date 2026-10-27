import { NextRequest, NextResponse } from "next/server";
import { getAvatarMedia } from "../../../../../lib/server/profile";
import { isUuid } from "../../../../../lib/server/validation";


export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isUuid(id)) {
      return new NextResponse("Not found", { status: 404 });
    }
    const media = await getAvatarMedia(id);
    if (!media) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(media.bytes), {
      status: 200,
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(media.byteSize),
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/profile/avatar/[id] failed", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

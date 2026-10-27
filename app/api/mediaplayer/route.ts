import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "@/lib/services/gateway";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  const live = await mediaService.getInfo(videoId);
  if (live && live.media) {
    return NextResponse.json(live);
  }

  return NextResponse.json(
    { error: "Media stream not found or mediaplayer service unavailable" },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    // Age entitlement is deliberately not accepted from the browser. The
    // MediaPlayer service only issues a session for public media and applies
    // its own age gate when the title requires an entitlement.
    const live = await mediaService.createSession(videoId);
    if (live?.session) {
      return NextResponse.json(live.session);
    }

    return NextResponse.json(
      { error: "Failed to create playback session with mediaplayer service" },
      { status: 502 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create playback session" }, { status: 500 });
  }
}

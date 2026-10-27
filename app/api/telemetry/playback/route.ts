import { NextRequest, NextResponse } from "next/server";
import { recordPlaybackTelemetry } from "@/lib/server/telemetry";
import { getActiveSession } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.videoId) {
      return NextResponse.json({ ok: false, error: "videoId is required" }, { status: 400 });
    }

    // Identity is established only from the authoritative session cookie.
    // Client-provided user/session identifiers must never be allowed to write
    // another account's watch history or analytics.
    const session = await getActiveSession(request);
    const result = await recordPlaybackTelemetry({
      eventId: body.eventId,
      clientTimestamp: body.clientTimestamp,
      userId: session?.userId ?? null,
      sessionId: session?.id ?? null,
      videoId: body.videoId,
      category: body.category || "Generic",
      eventType: body.eventType || "heartbeat",
      positionSec: Number(body.positionSec) || 0,
      videoDurationSec: Number(body.videoDurationSec) || 0,
      watchTimeSec: Number(body.watchTimeSec) || 0,
      completionRate: Number(body.completionRate) || 0,
      isMuted: body.isMuted,
      isFullscreen: body.isFullscreen,
      isPip: Boolean(body.isPip),
      streamResolution: body.streamResolution || "1080p",
      osName: body.osName || "unknown",
      networkType: body.networkType || "wifi",
      bufferingStalls: Number(body.bufferingStalls) || 0,
    });
    const status = result.status || (result.ok ? 200 : 500);
    return NextResponse.json(result, { status });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { recordAdPlaybackTelemetry } from "@/lib/server/telemetry";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.campaignId || !body?.videoId) {
      return NextResponse.json({ ok: false, error: "Missing campaignId or videoId" }, { status: 400 });
    }

    const res = await recordAdPlaybackTelemetry({
      eventId: body.eventId,
      clientTimestamp: body.clientTimestamp,
      campaignId: body.campaignId,
      userId: body.userId || "anon",
      sessionId: body.sessionId || null,
      videoId: body.videoId,
      adFormat: body.adFormat || "preroll",
      skippedAtSec: body.skippedAtSec !== undefined ? Number(body.skippedAtSec) : null,
      completed: Boolean(body.completed),
      audioMuted: Boolean(body.audioMuted),
      viewabilityPercent: body.viewabilityPercent !== undefined ? Number(body.viewabilityPercent) : 100,
      causedChurn: Boolean(body.causedChurn),
    });

    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

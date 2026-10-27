import { NextResponse } from "next/server";
import { recordSocialEngagementEvent } from "@/lib/server/telemetry";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.videoId || !body?.eventType) {
      return NextResponse.json({ ok: false, error: "Missing videoId or eventType" }, { status: 400 });
    }

    const res = await recordSocialEngagementEvent({
      userId: body.userId || "anon",
      sessionId: body.sessionId || null,
      videoId: body.videoId,
      eventType: body.eventType,
      metadata: body.metadata || {},
    });

    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

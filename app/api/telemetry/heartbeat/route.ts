import { NextRequest, NextResponse } from "next/server";
import { recordPlatformActivityHeartbeat } from "@/lib/server/telemetry";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await recordPlatformActivityHeartbeat({
      eventId: body.eventId,
      clientTimestamp: body.clientTimestamp,
      userId: body.userId || "anon-7",
      sessionId: body.sessionId || null,
      pageRoute: body.pageRoute || "/",
      activeSeconds: body.activeSeconds || 30,
      isTabFocused: body.isTabFocused ?? true,
    });
    const status = result.status || (result.ok ? 200 : 500);
    return NextResponse.json(result, { status });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { recordFeedImpressionsBatch } from "@/lib/server/telemetry";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const impressions = Array.isArray(body) ? body : body?.impressions;
    if (!impressions || !Array.isArray(impressions) || impressions.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing impressions array" }, { status: 400 });
    }

    const res = await recordFeedImpressionsBatch(impressions);
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

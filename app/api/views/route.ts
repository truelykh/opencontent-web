import { NextRequest, NextResponse } from "next/server";
import { viewsService } from "@/lib/services/gateway";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  const live = await viewsService.getViews(videoId);
  if (live) {
    const total = Number(live.views ?? live.totalViews ?? 0);
    const unique = Number(live.uniqueViews ?? live.uniqueEstimated ?? total);
    return NextResponse.json({
      ok: true,
      videoId,
      views: total,
      totalViews: total,
      uniqueViews: unique,
      uniqueEstimated: unique,
    });
  }

  return NextResponse.json(
    { error: "Views service unavailable" },
    { status: 502 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, fingerprint } = body;

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const live = await viewsService.recordView(videoId, fingerprint);
    if (live) {
      const total = Number(live.views ?? live.totalViews ?? 0);
      const unique = Number(live.uniqueViews ?? live.uniqueEstimated ?? total);
      return NextResponse.json({
        ok: true,
        recorded: true,
        videoId,
        views: total,
        totalViews: total,
        uniqueViews: unique,
        uniqueEstimated: unique,
        counted: live.counted ?? true,
      });
    }

    return NextResponse.json(
      { error: "Views service unavailable" },
      { status: 502 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}


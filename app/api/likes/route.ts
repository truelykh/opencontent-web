import { NextRequest, NextResponse } from "next/server";
import { likesService } from "@/lib/services/gateway";
import { resolveAccount } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  const { account } = await resolveAccount(request);
  const session = await getActiveSession(request);
  const userId = session?.accountId === account.id ? account.publicId : "";
  const live = await likesService.getLikes(videoId, userId);
  if (live) {
    const count = Number(live.likes ?? live.likeCount ?? 0);
    const liked = Boolean(live.hasLiked ?? live.liked);
    return NextResponse.json({
      ok: true,
      videoId,
      likes: count,
      likeCount: count,
      hasLiked: liked,
      liked: liked,
    });
  }

  return NextResponse.json(
    { error: "Likes service unavailable" },
    { status: 502 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const live = await likesService.toggleLike(videoId, account.publicId);
    if (live) {
      const count = Number(live.likes ?? live.likeCount ?? 0);
      const liked = Boolean(live.hasLiked ?? live.liked);
      return NextResponse.json({
        ok: true,
        videoId,
        likes: count,
        likeCount: count,
        hasLiked: liked,
        liked: liked,
      });
    }

    return NextResponse.json(
      { error: "Likes service unavailable" },
      { status: 502 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}

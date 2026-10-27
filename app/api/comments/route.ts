import { NextRequest, NextResponse } from "next/server";
import { commentsService } from "@/lib/services/gateway";
import { resolveAccount } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";

interface CommentRecord {
  id: string;
  authorName?: string;
  author?: string;
  avatar?: string;
  createdAt?: string;
  time?: string;
  content: string;
  likeCount?: number;
  likes?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");
    const cursor = searchParams.get("cursor") || "";

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const live = await commentsService.list(videoId, cursor);
    if (!live || !Array.isArray(live.comments)) {
      return NextResponse.json(
        { error: "Comments service unavailable or video not found" },
        { status: 502 }
      );
    }

    const mapped = (live.comments as CommentRecord[]).map((c) => ({
      id: c.id,
      author: c.authorName || c.author || "Anonymous",
      avatar: c.avatar || "",
      time: c.createdAt
        ? new Date(c.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : c.time || "Recently",
      content: c.content,
      likes: c.likeCount ?? c.likes ?? 0,
    }));

    return NextResponse.json({
      ok: true,
      comments: mapped,
      count: mapped.length,
      nextCursor: live.nextCursor || "",
      hasMore: Boolean(live.hasMore),
    });
  } catch (error) {
    console.error("[comments-bff] GET /api/comments error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with comments service", details: String(error) },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, content, parentId } = body;

    if (!videoId || !content?.trim()) {
      return NextResponse.json(
        { error: "videoId and content are required" },
        { status: 400 }
      );
    }

    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const authorName = account.publicId;
    const live = await commentsService.create(videoId, content, account.publicId, authorName, parentId);
    if (!live) {
      return NextResponse.json(
        { error: "Comments service failed to record comment" },
        { status: 502 }
      );
    }

    const c = live.comment || live;
    const mapped = {
      id: c.id,
      author: c.authorName || c.author || authorName || "Anonymous",
      avatar: "",
      time: "Just now",
      content: c.content,
      likes: c.likeCount ?? c.likes ?? 0,
    };

    return NextResponse.json({ ok: true, comment: mapped }, { status: 201 });
  } catch (error) {
    console.error("[comments-bff] POST /api/comments error:", error);
    return NextResponse.json(
      { error: "Failed to post comment to comments service", details: String(error) },
      { status: 502 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "comment id is required" }, { status: 400 });
  const { account } = await resolveAccount(request);
  const session = await getActiveSession(request);
  if (!session || session.accountId !== account.id) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }
  const deleted = await commentsService.remove(id, account.publicId);
  if (!deleted?.ok) return NextResponse.json({ error: "Comment not found or unauthorized" }, { status: 404 });
  return NextResponse.json({ ok: true, deleted: id });
}

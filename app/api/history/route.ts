import { NextRequest, NextResponse } from "next/server";
import { resolveAccount, attachAccountCookie } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";

const VIEWS_SERVICE_URL = process.env.VIEWS_SERVICE_URL ?? "http://localhost:8088";
const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN;

function internalServiceHeaders(userId: string): Headers {
  if (!INTERNAL_AUTH_TOKEN) throw new Error("Views internal service token is not configured");
  return new Headers({
    "X-User-ID": userId,
    "X-OpenContent-Service-Token": INTERNAL_AUTH_TOKEN,
  });
}

interface HistoryRecord {
  videoId: string;
  category?: string;
  totalWatchSeconds?: number;
  completionRate?: number;
  lastWatchedAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }

    const res = await fetch(`${VIEWS_SERVICE_URL}/history?userId=${encodeURIComponent(session.userId)}`, {
      headers: internalServiceHeaders(session.userId),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Views microservice failed to fetch watch history" },
        { status: res.status }
      );
    }

    const data: { history?: unknown } = await res.json();
    const history = (Array.isArray(data.history) ? data.history : [])
      .filter((value): value is HistoryRecord => typeof value === "object" && value !== null && typeof (value as { videoId?: unknown }).videoId === "string")
      .map((h) => ({
      videoId: h.videoId,
      category: h.category,
      totalWatchSeconds: Number(h.totalWatchSeconds) || 0,
      progress: Math.min(100, Math.round(Number(h.completionRate) || 0)),
      lastWatchedAt: h.lastWatchedAt,
    }));

    const response = NextResponse.json({ history, total: history.length });
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json(
      { error: "Views microservice unavailable" },
      { status: 502 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    let url = `${VIEWS_SERVICE_URL}/history?userId=${encodeURIComponent(session.userId)}`;
    if (videoId) {
      url += `&videoId=${encodeURIComponent(videoId)}`;
    }

    const res = await fetch(url, {
      method: "DELETE",
      headers: internalServiceHeaders(session.userId),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to clear watch history" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const response = NextResponse.json(data);
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json(
      { error: "Views microservice unavailable" },
      { status: 502 }
    );
  }
}

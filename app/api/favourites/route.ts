import { NextRequest, NextResponse } from "next/server";
import { resolveAccount, attachAccountCookie } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";
import { serviceUrl } from "../../../lib/services/config";

const PROFILE_SERVICE_URL = serviceUrl("profile");
const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN;
function profileHeaders(userId: string, contentType = false): Headers {
  if (!INTERNAL_AUTH_TOKEN) throw new Error("Profile internal service token is not configured");
  const headers = new Headers({ "X-User-ID": userId, "X-OpenContent-Service-Token": INTERNAL_AUTH_TOKEN });
  if (contentType) headers.set("Content-Type", "application/json");
  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }

    const res = await fetch(`${PROFILE_SERVICE_URL}/favourites?user_id=${encodeURIComponent(session.userId)}`, {
      headers: profileHeaders(session.userId),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch favourites from profile service" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const response = NextResponse.json({
      favourites: data.favourites || [],
      total: data.total || 0,
    });
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("GET /api/favourites error:", error);
    return NextResponse.json(
      { error: "Profile microservice unavailable" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const res = await fetch(`${PROFILE_SERVICE_URL}/favourites`, {
      method: "POST",
      headers: profileHeaders(session.userId, true),
      body: JSON.stringify({ videoId }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to save favourite" }, { status: res.status });
    }

    const data = await res.json();
    const response = NextResponse.json(data);
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("POST /api/favourites error:", error);
    return NextResponse.json(
      { error: "Profile microservice unavailable" },
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

    if (!videoId) {
      return NextResponse.json({ error: "videoId parameter is required" }, { status: 400 });
    }

    const res = await fetch(
      `${PROFILE_SERVICE_URL}/favourites?video_id=${encodeURIComponent(videoId)}`,
      {
        method: "DELETE",
        headers: profileHeaders(session.userId),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to remove favourite" }, { status: res.status });
    }

    const data = await res.json();
    const response = NextResponse.json(data);
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("DELETE /api/favourites error:", error);
    return NextResponse.json(
      { error: "Profile microservice unavailable" },
      { status: 502 }
    );
  }
}

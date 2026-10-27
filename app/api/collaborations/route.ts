import { NextRequest, NextResponse } from "next/server";
import { resolveAccount, attachAccountCookie } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";

const CHANNELS_SERVICE_URL = process.env.CHANNELS_SERVICE_URL ?? "http://localhost:8092";
const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN;

function serviceHeaders(headers: HeadersInit = {}): Headers {
  if (!INTERNAL_AUTH_TOKEN) throw new Error("Channels internal service token is not configured");
  const result = new Headers(headers);
  result.set("X-OpenContent-Service-Token", INTERNAL_AUTH_TOKEN);
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }

    const res = await fetch(`${CHANNELS_SERVICE_URL}/collaborations?userId=${encodeURIComponent(session.userId)}`, {
      headers: serviceHeaders({ "X-User-ID": session.userId }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Channels microservice failed to fetch collaborations" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const response = NextResponse.json({
      ok: true,
      collaborations: data.collaborations || [],
      total: data.total || 0,
    });
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("GET /api/collaborations error:", error);
    return NextResponse.json(
      { error: "Channels microservice unavailable" },
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
    const { searchParams } = new URL(request.url);
    const collabId = searchParams.get("collabId");

    // If collabId is provided, this is a status update (accept/decline/cancel)
    if (collabId) {
      const res = await fetch(
        `${CHANNELS_SERVICE_URL}/collaborations/status?collabId=${encodeURIComponent(collabId)}&userId=${encodeURIComponent(session.userId)}`,
        {
          method: "POST",
          headers: serviceHeaders({
            "Content-Type": "application/json",
            "X-User-ID": session.userId,
          }),
          body: JSON.stringify({ status: body.status }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json({ error: data.error || "Failed to update collaboration" }, { status: res.status });
      }

      const response = NextResponse.json(data);
      return attachAccountCookie(response, account.id);
    }

    // Otherwise, create a new collaboration invitation
    const { requesterChannelId, targetHandle, projectTitle, role, revenueSplit, note } = body;
    if (!requesterChannelId || !targetHandle || !projectTitle) {
      return NextResponse.json(
        { error: "requesterChannelId, targetHandle, and projectTitle are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${CHANNELS_SERVICE_URL}/collaborations`, {
      method: "POST",
      headers: serviceHeaders({
        "Content-Type": "application/json",
        "X-User-ID": session.userId,
      }),
      body: JSON.stringify({
        requesterChannelId,
        targetHandle,
        projectTitle,
        role: role || "co-creator",
        revenueSplit: revenueSplit || "50/50",
        note: note || "",
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Failed to create collaboration invitation" }, { status: res.status });
    }

    const response = NextResponse.json(data);
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("POST /api/collaborations error:", error);
    return NextResponse.json(
      { error: "Channels microservice unavailable" },
      { status: 502 }
    );
  }
}

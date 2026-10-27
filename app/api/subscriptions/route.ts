import { NextRequest, NextResponse } from "next/server";
import { resolveAccount, attachAccountCookie } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";
import { serviceUrl } from "../../../lib/services/config";

const PROFILE_SERVICE_URL = serviceUrl("profile");
const CHANNELS_SERVICE_URL = serviceUrl("channels");
const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN;
function profileHeaders(userId: string, contentType = false): Headers {
  if (!INTERNAL_AUTH_TOKEN) throw new Error("Profile internal service token is not configured");
  const headers = new Headers({ "X-User-ID": userId, "X-OpenContent-Service-Token": INTERNAL_AUTH_TOKEN });
  if (contentType) headers.set("Content-Type", "application/json");
  return headers;
}

interface SubscriptionRecord { channelId: string; bellStatus?: string; }
interface ChannelServiceRecord { id: string; name: string; handle: string; avatar?: string; subscribersCount?: number; isVerified?: boolean; description?: string; }
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export interface ChannelRecord {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  subscribers: string;
  subscribersCount: number;
  videosCount: number;
  verified: boolean;
  bellStatus: "all" | "none";
  isSubscribed: boolean;
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }

    // 1. Fetch user subscriptions from profile microservice
    const subRes = await fetch(`${PROFILE_SERVICE_URL}/subscriptions?subscriber_id=${encodeURIComponent(session.userId)}`, {
      headers: profileHeaders(session.userId),
      cache: "no-store",
    });

    if (!subRes.ok) {
      return NextResponse.json(
        { error: "Profile microservice failed to fetch subscriptions" },
        { status: subRes.status }
      );
    }

    const subData: { subscriptions?: unknown } = await subRes.json();
    const subs = (Array.isArray(subData.subscriptions) ? subData.subscriptions : [])
      .filter((value): value is SubscriptionRecord => isRecord(value) && typeof value.channelId === "string");

    if (subs.length === 0) {
      const response = NextResponse.json({ channels: [], total: 0 });
      return attachAccountCookie(response, account.id);
    }

    const bellMap = new Map<string, "all" | "none">(
      subs.map((s) => [s.channelId, s.bellStatus === "none" ? "none" : "all"])
    );

    // 2. Fetch channel catalog details from channels microservice
    const chRes = await fetch(`${CHANNELS_SERVICE_URL}/channels`, { cache: "no-store" });
    let allChannels: ChannelServiceRecord[] = [];
    if (chRes.ok) {
      const chData: { channels?: unknown } = await chRes.json();
      allChannels = (Array.isArray(chData.channels) ? chData.channels : [])
        .filter((value): value is ChannelServiceRecord => isRecord(value) && typeof value.id === "string" && typeof value.name === "string" && typeof value.handle === "string");
    }

    const channelMap = new Map<string, ChannelServiceRecord>(allChannels.map((channel) => [channel.id, channel]));

    const channels: ChannelRecord[] = subs.flatMap((s) => {
      const ch = channelMap.get(s.channelId);
      if (!ch) return [];
      const subCount = Number(ch?.subscribersCount ?? 0);
      return [{
        id: s.channelId,
        name: ch.name,
        handle: ch.handle,
        avatar: ch.avatar || "",
        subscribers: subCount >= 1000000 ? `${(subCount / 1000000).toFixed(1)}M` : subCount >= 1000 ? `${(subCount / 1000).toFixed(1)}K` : `${subCount}`,
        subscribersCount: subCount,
        videosCount: 0,
        verified: Boolean(ch.isVerified),
        bellStatus: bellMap.get(s.channelId) || "all",
        isSubscribed: true,
        description: ch.description || "",
      }];
    });

    const response = NextResponse.json({ channels, total: channels.length });
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("GET /api/subscriptions gateway error:", error);
    return NextResponse.json(
      { error: "Subscriptions upstream services unavailable" },
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
    const { channelId } = body;
    // The existing subscribe controls send just a channel ID. Preserve that
    // public BFF contract while keeping explicit mutation actions available.
    const action = typeof body.action === "string" ? body.action : "subscribe";

    if (!channelId) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    if (action === "unsubscribe") {
      const res = await fetch(
        `${PROFILE_SERVICE_URL}/subscriptions?channel_id=${encodeURIComponent(channelId)}`,
        {
          method: "DELETE",
          headers: profileHeaders(session.userId),
        }
      );
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to unsubscribe" }, { status: res.status });
      }

      const response = NextResponse.json({
        ok: true,
        channel: { id: channelId, isSubscribed: false, bellStatus: "none" },
      });
      return attachAccountCookie(response, account.id);
    }

    if (action === "subscribe") {
      const res = await fetch(`${PROFILE_SERVICE_URL}/subscriptions`, {
        method: "POST",
        headers: profileHeaders(session.userId, true),
        body: JSON.stringify({ channelId }),
      });
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to subscribe" }, { status: res.status });
      }

      const response = NextResponse.json({
        ok: true,
        channel: {
          id: channelId,
          isSubscribed: true,
          bellStatus: "all",
        },
      });
      return attachAccountCookie(response, account.id);
    }

    if (action === "toggle_bell") {
      const res = await fetch(
        `${PROFILE_SERVICE_URL}/subscriptions/bell?channel_id=${encodeURIComponent(channelId)}`,
        {
          method: "POST",
          headers: profileHeaders(session.userId),
        }
      );
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to toggle bell" }, { status: res.status });
      }
      const data = await res.json();
      const response = NextResponse.json({
        ok: true,
        channel: { id: channelId, bellStatus: data.bellStatus || "all" },
      });
      return attachAccountCookie(response, account.id);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/subscriptions gateway error:", error);
    return NextResponse.json(
      { error: "Subscriptions microservice unavailable" },
      { status: 502 }
    );
  }
}

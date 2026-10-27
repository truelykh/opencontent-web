import { NextRequest, NextResponse } from "next/server";
import { resolveAccount, attachAccountCookie } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";
import { serviceUrl } from "../../../lib/services/config";

const CHANNELS_SERVICE_URL = serviceUrl("channels");
const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN;

function internalServiceHeaders(headers: HeadersInit = {}): Headers {
  const protectedHeaders = new Headers(headers);
  if (!INTERNAL_AUTH_TOKEN) {
    throw new Error("Channels internal service token is not configured");
  }
  protectedHeaders.set("X-OpenContent-Service-Token", INTERNAL_AUTH_TOKEN);
  return protectedHeaders;
}

type ChannelRecord = { id: string; userId: string };
type ChannelsLookup = { channel?: ChannelRecord | null; channels?: ChannelRecord[] };

type ChannelPayload = Record<string, unknown>;

function asChannelPayload(value: unknown): ChannelPayload {
  return value !== null && typeof value === "object"
    ? (value as ChannelPayload)
    : {};
}

function finiteCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * The Go channel service owns channel metadata, while creator metrics are
 * accumulated by other services. Keep the BFF response stable for Studio
 * views by supplying the zero-value metrics until those aggregates arrive.
 */
function normalizeChannel(value: unknown, index = 0): ChannelPayload {
  const channel = asChannelPayload(value);
  const isVerified = channel.isVerified === true;
  return {
    ...channel,
    accountId:
      typeof channel.accountId === "string"
        ? channel.accountId
        : typeof channel.userId === "string"
          ? channel.userId
          : "",
    subscribersCount: finiteCount(channel.subscribersCount),
    videosCount: finiteCount(channel.videosCount),
    totalViews: finiteCount(channel.totalViews),
    isPrimary: channel.isPrimary === true || index === 0,
    status: channel.status === "verified" || isVerified ? "verified" : "active",
  };
}

async function getOwnedChannel(channelId: string, userId: string): Promise<NextResponse | null> {
  const lookupUrl = new URL(`${CHANNELS_SERVICE_URL}/channels`);
  lookupUrl.searchParams.set("id", channelId);
  const lookup = await fetch(lookupUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!lookup.ok) {
    return NextResponse.json({ error: "channel_lookup_failed" }, { status: 502 });
  }
  const data = (await lookup.json()) as ChannelsLookup;
  const channel = data.channel ?? data.channels?.[0] ?? null;
  if (!channel) {
    return NextResponse.json({ error: "channel_not_found" }, { status: 404 });
  }
  if (channel.userId !== userId) {
    return NextResponse.json({ error: "channel_forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * Opencontent Creator Channels BFF Route
 * ---------------------------------------
 * Architecture:
 * - Frontend: Next.js (React)
 * - Backend: Go Microservice (:8092)
 * - Database: PostgreSQL (openconnect_channels)
 * 
 * Features:
 * - Channel Creation & Publishing (Channel Name, @handle)
 * - 14-Day Cooldown on Handle Changes
 * - Channel Customization: Banner image, Avatar, Watermark, Description
 * - Strict Guardrails: Doctor & Gov categories rejected
 * - Mapped strictly to creator's 7-character User ID
 */

export async function GET(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const requestedUserId = searchParams.get("userId");
    const requestedChannelId = searchParams.get("id") || searchParams.get("channelId");

    const goUrl = new URL(`${CHANNELS_SERVICE_URL}/channels`);
    if (requestedChannelId) {
      goUrl.searchParams.set("id", requestedChannelId);
    } else if (handle) {
      goUrl.searchParams.set("handle", handle);
    } else if (requestedUserId) {
      goUrl.searchParams.set("userId", requestedUserId);
    } else {
      goUrl.searchParams.set("userId", account.publicId || account.id);
    }

    let goRes = await fetch(goUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (goRes.ok && !requestedChannelId && !handle && !requestedUserId && account.id && account.id !== account.publicId) {
      const initialData = await goRes.clone().json().catch(() => null);
      if (!initialData || (!initialData.channel && (!initialData.channels || initialData.channels.length === 0))) {
        const fallbackUrl = new URL(`${CHANNELS_SERVICE_URL}/channels`);
        fallbackUrl.searchParams.set("userId", account.id);
        const fallbackRes = await fetch(fallbackUrl.toString(), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(4000),
        });
        if (fallbackRes.ok) {
          goRes = fallbackRes;
        }
      }
    }

    if (!goRes.ok) {
      if (goRes.status === 404) {
        return NextResponse.json({ channels: [], channel: null, activeChannel: null, maxLimit: 5, usedCount: 0, canCreate: true }, { status: 200 });
      }
      return NextResponse.json(
        { error: "Channels service error", status: goRes.status },
        { status: 502 }
      );
    }

    const data = asChannelPayload(await goRes.json());
    const rawChannels = Array.isArray(data.channels)
      ? data.channels
      : data.channel
        ? [data.channel]
        : [];
    const channels = rawChannels.map((channel, index) =>
      normalizeChannel(channel, index)
    );
    const activeChannel = data.channel
      ? normalizeChannel(data.channel)
      : channels[0] || null;

    const response = NextResponse.json({
      channels,
      activeChannel,
      maxLimit: 5,
      usedCount: channels.length,
      canCreate: channels.length < 5,
    });
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("GET /api/channels failed:", error);
    return NextResponse.json(
      { error: "Channels service unavailable" },
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

    if (!body || !body.name) {
      return NextResponse.json(
        { error: "Channel name is required to publish channel." },
        { status: 400 }
      );
    }

    // Ownership is always derived from the verified account cookie/session.
    // A client-provided userId must never select another creator's namespace.
    const effectiveUserId = account.publicId || account.id;

    // Call Go Channels Microservice (:8092) -> PostgreSQL (openconnect_channels)
    const goRes = await fetch(`${CHANNELS_SERVICE_URL}/channels`, {
      method: "POST",
      headers: internalServiceHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        userId: effectiveUserId,
        name: body.name,
        handle: body.handle,
        description: body.description || "",
        category: body.category || "Entertainment",
        avatar: body.avatar || "",
        bannerUrl: body.bannerUrl || "",
        watermarkUrl: body.watermarkUrl || "",
      }),
      signal: AbortSignal.timeout(4000),
    });

    const data = await goRes.json();
    if (!goRes.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Failed to update channel", message: data.message },
        { status: goRes.status }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: data.message,
      channel: normalizeChannel(data.channel),
      channels: [normalizeChannel(data.channel)],
    }, { status: 201 });
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("POST /api/channels failed:", error);
    return NextResponse.json(
      { error: "Failed to publish channel", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const channelId =
      typeof body?.channelId === "string"
        ? body.channelId
        : typeof body?.id === "string"
          ? body.id
          : "";
    if (!channelId) {
      return NextResponse.json({ error: "channel_id_required" }, { status: 400 });
    }
    const ownershipFailure = await getOwnedChannel(channelId, account.publicId || account.id);
    if (ownershipFailure) {
      return ownershipFailure;
    }

    // UpsertChannel identifies the record from the verified user identity. A
    // caller-supplied ID is used only for the ownership check above.
    const goRes = await fetch(`${CHANNELS_SERVICE_URL}/channels`, {
      method: "POST",
      headers: internalServiceHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        userId: account.publicId || account.id,
        name: body.name,
        handle: body.handle,
        description: body.description || "",
        category: body.category || "Entertainment",
        avatar: body.avatar || "",
        bannerUrl: body.bannerUrl || "",
        watermarkUrl: body.watermarkUrl || "",
      }),
      signal: AbortSignal.timeout(4000),
    });
    const data = await goRes.json().catch(() => null);
    if (!goRes.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Failed to update channel" },
        { status: goRes.status }
      );
    }
    const response = NextResponse.json({
      ok: true,
      message: data?.message,
      channel: data?.channel,
      channels: data?.channel ? [data.channel] : [],
    });
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("PUT /api/channels failed:", error);
    return NextResponse.json({ error: "Failed to update channel" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const channelId = new URL(request.url).searchParams.get("id") ?? "";
    if (!channelId) {
      return NextResponse.json({ error: "channel_id_required" }, { status: 400 });
    }
    const userId = account.publicId || account.id;
    const ownershipFailure = await getOwnedChannel(channelId, userId);
    if (ownershipFailure) {
      return ownershipFailure;
    }
    const upstream = await fetch(`${CHANNELS_SERVICE_URL}/channels?id=${encodeURIComponent(channelId)}`, {
      method: "DELETE",
      headers: internalServiceHeaders({ "X-OpenContent-User": userId }),
      signal: AbortSignal.timeout(4000),
    });
    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json({ error: "channel_delete_failed" }, { status: upstream.status === 403 ? 403 : 502 });
  } catch (error) {
    console.error("DELETE /api/channels failed:", error);
    return NextResponse.json({ error: "Failed to delete channel" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { resolveAccount } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";
import { serviceUrl } from "../../../lib/services/config";
import type { AgeProfile, ContentFormatType, VideoItem } from "../../../types";

const VIDEOS_SERVICE_URL = serviceUrl("videos");
const CHANNELS_SERVICE_URL = serviceUrl("channels");

function textField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function integerField(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function tagList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string");
  }
  return typeof value === "string" ? value.split(",") : [];
}

async function compensateUnlinkedUpload(mediaId: string, ownerPublicId: string): Promise<void> {
  try {
    const response = await fetch(`${VIDEOS_SERVICE_URL}/media/upload?id=${encodeURIComponent(mediaId)}`, {
      method: "DELETE",
      headers: {
        "X-OpenContent-Media-Token": process.env.MEDIA_INTERNAL_TOKEN ?? "",
        "X-OpenContent-User": ownerPublicId,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok && response.status !== 404) {
      console.error("[videos-bff] upload compensation failed", { mediaId, status: response.status });
    }
  } catch (error) {
    console.error("[videos-bff] upload compensation request failed", { mediaId, error });
  }
}
const VIEWS_SERVICE_URL = serviceUrl("views");

type VideoServiceRecord = Record<string, unknown>;

const stringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const numberValue = (value: unknown): number =>
  typeof value === "number" || typeof value === "string" ? Number(value) || 0 : 0;

function ageProfile(value: unknown): AgeProfile {
  return value === "kids" || value === "teen" || value === "adult" ? value : "all";
}

function publicationStatus(value: unknown): VideoItem["status"] {
  return value === "draft" || value === "transcoding" || value === "review" || value === "published"
    ? value
    : "published";
}

function contentFormat(value: unknown): ContentFormatType | undefined {
  const supported: readonly ContentFormatType[] = [
    "video", "short_video", "audio", "movie", "series", "vertical_series", "pdf",
    "web_series", "manga", "cartoons", "news_video", "digital_newspaper", "music",
    "sports", "anime", "articles", "gaming", "generic",
  ];
  return typeof value === "string" && supported.includes(value as ContentFormatType)
    ? value as ContentFormatType
    : undefined;
}

/** Converts the Go service record into the public UI contract for every response path. */
function formatVideo(video: VideoServiceRecord): VideoItem {
  const contentType = contentFormat(video.contentType);
  const privacy = video.privacy === "private" || video.privacy === "unlisted" || video.privacy === "public"
    ? video.privacy
    : "public";
  return {
    id: stringValue(video.id),
    channelId: stringValue(video.channelId) || undefined,
    catalogCode: stringValue(video.catalogCode),
    title: stringValue(video.title),
    description: stringValue(video.description),
    duration: stringValue(video.duration),
    durationSec: numberValue(video.durationSec),
    thumbnail: stringValue(video.thumbnail),
    videoUrl: stringValue(video.videoUrl) || `/api/media/${encodeURIComponent(String(video.id))}`,
    ageProfile: ageProfile(video.ageProfile),
    category: stringValue(video.genre, "Generic"),
    ...(contentType ? { contentType } : {}),
    privacy,
    filmCertification: stringValue(video.filmCertification) || undefined,
    certificateDoc: stringValue(video.certificateDoc) || undefined,
    sportsTournament: stringValue(video.sportsTournament) || undefined,
    sportsSchedule: stringValue(video.sportsSchedule) || undefined,
    sportsResult: stringValue(video.sportsResult) || undefined,
    mediaDocUrl: stringValue(video.mediaDocUrl) || undefined,
    uploader: {
      name: stringValue(video.uploaderName, "Opencontent creator"),
      avatar: stringValue(video.uploaderAvatar),
      verified: Boolean(video.uploaderVerified),
    },
    views: numberValue(video.viewsCount),
    likes: numberValue(video.likesCount),
    publishedDate: stringValue(video.publishedDate),
    status: publicationStatus(video.status),
    tags: Array.isArray(video.tags) ? video.tags.filter((tag): tag is string => typeof tag === "string") : [],
    publicDomainLicense: stringValue(video.publicDomainLicense),
    similarityScore: numberValue(video.similarityScore ?? video.matchPercentage) || undefined,
    matchPercentage: numberValue(video.matchPercentage ?? video.similarityScore) || undefined,
    adSettings: {
      monetizationEnabled: Boolean(video.monetizationEnabled),
      preRoll: Boolean(video.preRoll),
      midRoll: Boolean(video.midRoll),
      bannerAd: Boolean(video.bannerAd),
      impressions: numberValue(video.adImpressions),
      revenue: numberValue(video.adRevenue),
      cpm: numberValue(video.cpm),
    },
  };
}

/**
 * The catalogue must never turn generic demonstration media into a public title.
 * Keep this at the trust boundary so every feed, search result, player, and shelf
 * receives the same clean record set while legacy rows are being remediated.
 */
function isSampleMediaRecord(video: { videoUrl?: unknown; thumbnail?: unknown; uploaderAvatar?: unknown }) {
  const values = [video.videoUrl, video.thumbnail, video.uploaderAvatar]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.toLowerCase());

  return values.some(
    (value) =>
      value.includes("commondatastorage.googleapis.com/gtv-videos-bucket/sample/") ||
      value.includes("/sample/bigbuckbunny") ||
      value.includes("/sample/elephantsdream")
  );
}

/**
 * Opencontent Video Catalog BFF Route
 * -----------------------------------
 * Architecture:
 * - Frontend: Next.js (React)
 * - Backend: Go Microservice (:8091)
 * - Database: PostgreSQL (openconnect_videos)
 * 
 * Features:
 * - 10-digit unique Video IDs
 * - Auto-generated sequential catalog code (e.g. ABC-143)
 * - Series / Vertical AI Series continuity (Netflix/Prime-style)
 * - Film certifications (U, UA 7+, UA 13+, UA 16+, A)
 * - Strict genre guardrails (no doctor, no gov)
 * - ETag 304 edge caching
 * - Zero mock data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const genre = searchParams.get("genre") || searchParams.get("category");
    const userId = searchParams.get("userId");
    const contentType = searchParams.get("contentType");
    const privacy = searchParams.get("privacy");
    const search = searchParams.get("q");
    const semantic = searchParams.get("semantic");
    const minScore = searchParams.get("minScore");

    const goUrl = new URL(`${VIDEOS_SERVICE_URL}/videos`);
    if (id) goUrl.searchParams.set("id", id);
    if (genre && genre !== "All" && genre !== "trending") goUrl.searchParams.set("genre", genre);
    if (userId) goUrl.searchParams.set("userId", userId);
    if (contentType) goUrl.searchParams.set("contentType", contentType);
    if (privacy) goUrl.searchParams.set("privacy", privacy);
    if (search) goUrl.searchParams.set("q", search);
    if (semantic === "true") goUrl.searchParams.set("semantic", "true");
    if (minScore) goUrl.searchParams.set("minScore", minScore);

    const goRes = await fetch(goUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (!goRes.ok) {
      if (goRes.status === 404) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Video service error", status: goRes.status },
        { status: 502 }
      );
    }

    const data: { videos?: unknown } = await goRes.json();

    // Map Go Video structure to VideoItem format expected by UI components
    if (data.videos && Array.isArray(data.videos)) {
      const formattedVideos = data.videos
        .filter((value): value is VideoServiceRecord => typeof value === "object" && value !== null)
        .filter((video) => !isSampleMediaRecord(video))
        .map(formatVideo);

      let resultVideos = formattedVideos;
      if (genre?.toLowerCase() === "trending") {
        try {
          const trendRes = await fetch(`${VIEWS_SERVICE_URL}/trending`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: AbortSignal.timeout(2500),
          });
          if (trendRes.ok) {
            const trendData: { items?: unknown } = await trendRes.json();
            const rank = new Map<string, number>(
              (Array.isArray(trendData.items) ? trendData.items : [])
                .filter((item): item is VideoServiceRecord => typeof item === "object" && item !== null)
                .map((item, index) => [String(item.videoId), index])
            );
            resultVideos = formattedVideos
              .filter((video) => rank.has(String(video.id)))
              .sort((a, b) => (rank.get(String(a.id)) ?? Number.MAX_SAFE_INTEGER) - (rank.get(String(b.id)) ?? Number.MAX_SAFE_INTEGER));
          } else {
            resultVideos = [];
          }
        } catch {
          resultVideos = [];
        }
      }

      // ETag deterministic calculation
      const payloadString = JSON.stringify(resultVideos);
      const etag = `W/"${createHash("sha256").update(payloadString).digest("hex").slice(0, 24)}"`;

      if (request.headers.get("if-none-match") === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            "Cache-Control": "public, max-age=10, s-maxage=30, stale-while-revalidate=60",
          },
        });
      }

      return NextResponse.json(
        { videos: resultVideos, total: resultVideos.length },
        {
          headers: {
            ETag: etag,
            "Cache-Control": "public, max-age=10, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[videos-bff] Error fetching videos from Go microservice:", err);
    return NextResponse.json(
      { error: "Video catalogue is temporarily unavailable." },
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
    const isMultipart = request.headers.get("content-type")?.includes("multipart/form-data") ?? false;
    const rawBody: unknown = isMultipart
      ? Object.fromEntries((await request.formData()).entries())
      : await request.json();
    const body = rawBody !== null && typeof rawBody === "object"
      ? (rawBody as Record<string, unknown>)
      : {};
    const mediaFile = isMultipart ? body.media : null;
    const title = textField(body.title);
    const requestedChannelId = textField(body.channelId);

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (!requestedChannelId) {
      return NextResponse.json({ error: "A valid channel is required to upload content." }, { status: 400 });
    }

    if (isMultipart) {
      if (!(mediaFile instanceof File) || mediaFile.size === 0) return NextResponse.json({ error: "A media file is required." }, { status: 400 });
      const uploadForm = new FormData();
      uploadForm.append("media", mediaFile, mediaFile.name);
      const uploadRes = await fetch(`${VIDEOS_SERVICE_URL}/media/upload`, {
        method: "POST",
        headers: {
          "X-OpenContent-Media-Token": process.env.MEDIA_INTERNAL_TOKEN ?? "",
          "X-OpenContent-User": String(account.publicId),
          "X-OpenContent-Channel": requestedChannelId,
        },
        body: uploadForm,
        signal: AbortSignal.timeout(120000),
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) return NextResponse.json(uploadData, { status: uploadRes.status });
      body.mediaId = uploadData.mediaId;
      body.videoUrl = "";
    }

    // Backend Channel Ownership Validation:
    // Fetch the channel from the real Channels microservice to verify ownership
    const chUrl = new URL(`${CHANNELS_SERVICE_URL}/channels`);
    chUrl.searchParams.set("id", requestedChannelId);

    const chRes = await fetch(chUrl.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (!chRes.ok) {
      return NextResponse.json(
        { error: "Could not verify channel with channel service." },
        { status: 502 }
      );
    }

    const chData = await chRes.json();
    const verifiedChannel = chData.channel || (chData.channels && chData.channels[0]);

    if (!verifiedChannel) {
      return NextResponse.json(
        { error: "The specified channel does not exist." },
        { status: 404 }
      );
    }

    // Validate ownership: authenticated user's ID must match the channel's owner user_id
    const userMatches =
      verifiedChannel.userId === account.publicId ||
      verifiedChannel.userId === account.id;

    if (!userMatches) {
      return NextResponse.json(
        { error: "Channel ownership verification failed. You do not own this channel." },
        { status: 403 }
      );
    }

    // Bind trusted channel identity fields from the verified channel record
    const safePayload = {
      userId: verifiedChannel.userId,
      channelId: verifiedChannel.id,
      uploaderName: verifiedChannel.name,
      uploaderAvatar: verifiedChannel.avatar || "",
      uploaderVerified: Boolean(verifiedChannel.isVerified),
      title,
      description: textField(body.description),
      genre: textField(body.genre) || textField(body.category) || "Generic",
      contentType: textField(body.contentType) || "video",
      privacy: textField(body.privacy) || "public",
      status: textField(body.status) === "draft" ? "draft" : "published",
      tags: tagList(body.tags),
      videoUrl: textField(body.videoUrl),
      thumbnail: textField(body.thumbnail),
      mediaId: textField(body.mediaId),
      seriesName: textField(body.seriesName),
      seasonNumber: integerField(body.seasonNumber, 1),
      episodeNumber: integerField(body.episodeNumber, 1),
      episodeTitle: textField(body.episodeTitle),
      filmCertification: textField(body.filmCertification),
      certificateDoc: textField(body.certificateDoc),
      sportsTournament: textField(body.sportsTournament),
      sportsSchedule: textField(body.sportsSchedule),
      sportsResult: textField(body.sportsResult),
      mediaDocUrl: textField(body.mediaDocUrl),
      publicDomainLicense: textField(body.publicDomainLicense),
    };

    const goRes = await fetch(`${VIDEOS_SERVICE_URL}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safePayload),
      signal: AbortSignal.timeout(4000),
    });

    const data: { video?: unknown } = await goRes.json().catch(() => ({}));
    if (!goRes.ok && safePayload.mediaId) {
      await compensateUnlinkedUpload(safePayload.mediaId, account.publicId);
    }
    if (goRes.ok && data.video && typeof data.video === "object") {
      return NextResponse.json({ ...data, video: formatVideo(data.video as VideoServiceRecord) }, { status: goRes.status });
    }
    return NextResponse.json(data, { status: goRes.status });
  } catch (err) {
    console.error("[videos-bff] Error posting video to Go microservice:", err);
    return NextResponse.json({ error: "Unable to publish the video right now." }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  return mutateVideo(request, "PATCH");
}

export async function DELETE(request: NextRequest) {
  return mutateVideo(request, "DELETE");
}

async function mutateVideo(request: NextRequest, method: "PATCH" | "DELETE") {
  const { account } = await resolveAccount(request);
  const session = await getActiveSession(request);
  if (!session || session.accountId !== account.id) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "video id is required" }, { status: 400 });
  const goRes = await fetch(`${VIDEOS_SERVICE_URL}/videos?id=${encodeURIComponent(id)}`, { method, headers: { "Content-Type": "application/json", "X-OpenContent-Media-Token": process.env.MEDIA_INTERNAL_TOKEN ?? "", "X-OpenContent-User": account.publicId }, body: method === "PATCH" ? JSON.stringify(await request.json()) : undefined, signal: AbortSignal.timeout(10000) });
  const data = await goRes.json().catch(() => ({ error: "video service error" }));
  return NextResponse.json(data, { status: goRes.status });
}

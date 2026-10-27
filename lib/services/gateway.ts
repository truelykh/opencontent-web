import { SERVICE_CONFIG } from "./config";

function internalServiceHeaders(headers: HeadersInit = {}): Headers {
  const result = new Headers(headers);
  const token = process.env.INTERNAL_AUTH_TOKEN;
  if (token) result.set("X-OpenContent-Service-Token", token);
  return result;
}

/**
 * Common Gateway Fetch Utility with Timeout & Resilience
 */
async function gatewayFetch<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 1500
): Promise<{ ok: boolean; data: T | null; status: number }> {
  try {
    const res = await fetch(url, {
      ...options,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.ok) {
      const data = (await res.json()) as T;
      return { ok: true, data, status: res.status };
    }
    return { ok: false, data: null, status: res.status };
  } catch {
    return { ok: false, data: null, status: 503 };
  }
}

/* ------------------------------------------------------------------ */
/* 1. Views Service Client                                            */
/* ------------------------------------------------------------------ */

export interface ViewsResponse {
  ok?: boolean;
  videoId: string;
  views?: number;
  totalViews?: number;
  uniqueViews?: number;
  uniqueEstimated?: number;
  counted?: boolean;
}

export const viewsService = {
  async getViews(videoId: string): Promise<ViewsResponse | null> {
    const url = `${SERVICE_CONFIG.views.baseUrl}/views?videoId=${encodeURIComponent(videoId)}`;
    const res = await gatewayFetch<ViewsResponse>(url, {}, SERVICE_CONFIG.views.timeoutMs);
    return res.data;
  },

  async recordView(videoId: string, fingerprint?: string): Promise<ViewsResponse | null> {
    const url = `${SERVICE_CONFIG.views.baseUrl}/views/record`;
    const res = await gatewayFetch<ViewsResponse>(
      url,
      {
        method: "POST",
        headers: internalServiceHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ videoId, fingerprint: fingerprint || "" }),
      },
      SERVICE_CONFIG.views.timeoutMs
    );
    return res.data;
  },
};

/* ------------------------------------------------------------------ */
/* 2. Likes Service Client                                            */
/* ------------------------------------------------------------------ */

export interface LikesResponse {
  ok?: boolean;
  videoId: string;
  likes?: number;
  likeCount?: number;
  hasLiked?: boolean;
  liked?: boolean;
}

export const likesService = {
  async getLikes(videoId: string, userId?: string): Promise<LikesResponse | null> {
    const url = `${SERVICE_CONFIG.likes.baseUrl}/likes?videoId=${encodeURIComponent(videoId)}&userId=${encodeURIComponent(userId || "")}`;
    const res = await gatewayFetch<LikesResponse>(url, { headers: internalServiceHeaders() }, SERVICE_CONFIG.likes.timeoutMs);
    return res.data;
  },

  async toggleLike(videoId: string, userId?: string): Promise<LikesResponse | null> {
    const url = `${SERVICE_CONFIG.likes.baseUrl}/likes/toggle`;
    const res = await gatewayFetch<LikesResponse>(
      url,
      {
        method: "POST",
        headers: internalServiceHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ videoId, userId: userId || "anonymous-viewer" }),
      },
      SERVICE_CONFIG.likes.timeoutMs
    );
    return res.data;
  },
};

/* ------------------------------------------------------------------ */
/* 3. Comments Service Client                                         */
/* ------------------------------------------------------------------ */

export interface CommentPayload {
  id: string;
  videoId: string;
  authorId?: string;
  authorName?: string;
  content: string;
  createdAt?: string;
  likeCount?: number;
  likes?: number;
  author?: string;
  comment?: CommentPayload;
}

export interface CommentsListResponse {
  ok?: boolean;
  comments: CommentPayload[];
  count?: number;
  nextCursor?: string;
  hasMore?: boolean;
}

export const commentsService = {
  async list(videoId: string, cursor?: string, limit: number = 50): Promise<CommentsListResponse | null> {
    const query = new URLSearchParams({ videoId, limit: String(limit) });
    if (cursor) query.set("cursor", cursor);
    const url = `${SERVICE_CONFIG.comments.baseUrl}/comments?${query.toString()}`;
    const res = await gatewayFetch<CommentsListResponse>(url, { headers: internalServiceHeaders() }, SERVICE_CONFIG.comments.timeoutMs);
    return res.data;
  },

  async create(videoId: string, content: string, authorId: string, authorName: string, parentId?: string): Promise<CommentPayload | null> {
    const url = `${SERVICE_CONFIG.comments.baseUrl}/comments`;
    const res = await gatewayFetch<CommentPayload>(
      url,
      {
        method: "POST",
        headers: internalServiceHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          videoId,
          content: content.trim(),
          authorId,
          authorName,
          parentId: parentId || "",
        }),
      },
      SERVICE_CONFIG.comments.timeoutMs
    );
    return res.data;
  },

  async remove(commentId: string, authorId: string): Promise<{ ok?: boolean } | null> {
    const query = new URLSearchParams({ id: commentId, authorId });
    const res = await gatewayFetch<{ ok?: boolean }>(
      `${SERVICE_CONFIG.comments.baseUrl}/comments?${query.toString()}`,
      { method: "DELETE", headers: internalServiceHeaders() },
      SERVICE_CONFIG.comments.timeoutMs
    );
    return res.data;
  },
};

/* ------------------------------------------------------------------ */
/* 4. MediaPlayer Service Client                                      */
/* ------------------------------------------------------------------ */

export interface MediaInfoResponse {
  ok?: boolean;
  media?: {
    videoId: string;
    title: string;
    streamUrl: string;
    durationSec: number;
    ageRating: string;
    requires18Plus: boolean;
    resolutions: string[];
    license: string;
  };
}

export interface StreamSessionResponse {
  ok?: boolean;
  session?: {
    sessionId: string;
    videoId: string;
    token: string;
    playbackUrl: string;
    expiresAt: string;
  };
}

export const mediaService = {
  async getInfo(videoId: string): Promise<MediaInfoResponse | null> {
    const url = `${SERVICE_CONFIG.mediaplayer.baseUrl}/mediaplayer/info?videoId=${encodeURIComponent(videoId)}`;
    const res = await gatewayFetch<MediaInfoResponse>(url, { headers: internalServiceHeaders() }, SERVICE_CONFIG.mediaplayer.timeoutMs);
    return res.data;
  },

  async createSession(videoId: string): Promise<StreamSessionResponse | null> {
    const url = `${SERVICE_CONFIG.mediaplayer.baseUrl}/mediaplayer/session`;
    const res = await gatewayFetch<StreamSessionResponse>(
      url,
      {
        method: "POST",
        headers: internalServiceHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ videoId }),
      },
      SERVICE_CONFIG.mediaplayer.timeoutMs
    );
    return res.data;
  },
};

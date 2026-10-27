/**
 * Opencontent Production-Grade Client SDK
 * Includes:
 * - Request timeouts (AbortController) to prevent indefinite network hanging.
 * - Exponential backoff retry for network errors and 502/503/504 responses.
 * - Uniform error normalization and typed envelopes.
 */

export interface CollaborationRecord {
  id: string;
  requesterChannelId: string;
  targetChannelId: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  projectTitle?: string;
  role?: string;
  revenueSplit?: string;
  note?: string;
  targetHandle?: string;
  createdAt?: string;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 2,
  timeoutMs: number = 8000
): Promise<Response> {
  const isIdempotent = !options.method || options.method === "GET" || options.method === "HEAD";

  let lastError: Error | null = null;
  const maxAttempts = isIdempotent ? retries + 1 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const mergedSignal = options.signal
        ? anySignal([options.signal, controller.signal])
        : controller.signal;

      const response = await fetch(url, {
        ...options,
        signal: mergedSignal,
      });

      clearTimeout(timer);

      // Retry on transient server errors
      if (isIdempotent && attempt < retries && [502, 503, 504].includes(response.status)) {
        await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
        continue;
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));
      if (err instanceof DOMException && err.name === "AbortError") {
        lastError = new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
      }

      if (isIdempotent && attempt < retries) {
        await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
        continue;
      }
      break;
    }
  }

  throw lastError || new Error(`Failed request to ${url}`);
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}

export const apiClient = {
  views: {
    async get(videoId: string) {
      try {
        const res = await fetchWithRetry(`/api/views?videoId=${encodeURIComponent(videoId)}`, {
          cache: "no-store",
        });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.views.get error:", e);
        return null;
      }
    },

    async record(videoId: string, fingerprint?: string) {
      try {
        const res = await fetchWithRetry("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, fingerprint }),
        });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.views.record error:", e);
        return null;
      }
    },
  },

  likes: {
    async get(videoId: string, userId?: string) {
      try {
        const url = `/api/likes?videoId=${encodeURIComponent(videoId)}${userId ? `&userId=${encodeURIComponent(userId)}` : ""}`;
        const res = await fetchWithRetry(url, { cache: "no-store" });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.likes.get error:", e);
        return null;
      }
    },

    async toggle(videoId: string, userId?: string) {
      try {
        const res = await fetchWithRetry("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, userId }),
        });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.likes.toggle error:", e);
        return null;
      }
    },
  },

  dislikes: {
    async get(videoId: string) {
      try {
        const res = await fetchWithRetry(`/api/dislikes?videoId=${encodeURIComponent(videoId)}`, { cache: "no-store" });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.dislikes.get error:", e);
        return null;
      }
    },

    async toggle(videoId: string) {
      try {
        const res = await fetchWithRetry("/api/dislikes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.dislikes.toggle error:", e);
        return null;
      }
    },
  },

  comments: {
    async list(videoId: string, cursor?: string) {
      try {
        const url = `/api/comments?videoId=${encodeURIComponent(videoId)}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
        const res = await fetchWithRetry(url, { cache: "no-store" });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.comments.list error:", e);
        return null;
      }
    },

    async post(videoId: string, content: string, authorName?: string, parentId?: string) {
      try {
        const res = await fetchWithRetry("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, content, authorName, parentId }),
        });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.comments.post error:", e);
        return null;
      }
    },
  },

  mediaplayer: {
    async getInfo(videoId: string) {
      try {
        const res = await fetchWithRetry(`/api/mediaplayer?videoId=${encodeURIComponent(videoId)}`, {
          cache: "no-store",
        });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.mediaplayer.getInfo error:", e);
        return null;
      }
    },

    async createSession(videoId: string) {
      try {
        const res = await fetchWithRetry("/api/mediaplayer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        return res.ok ? await res.json() : null;
      } catch (e) {
        console.warn("apiClient.mediaplayer.createSession error:", e);
        return null;
      }
    },
  },

  videos: {
    async list(params?: {
      category?: string;
      q?: string;
      userId?: string;
      contentType?: string;
      privacy?: string;
      id?: string;
      semantic?: boolean;
      minScore?: number;
    }) {
      try {
        const query = new URLSearchParams();
        if (params?.category) query.set("category", params.category);
        if (params?.q) query.set("q", params.q);
        if (params?.userId) query.set("userId", params.userId);
        if (params?.contentType) query.set("contentType", params.contentType);
        if (params?.privacy) query.set("privacy", params.privacy);
        if (params?.id) query.set("id", params.id);
        if (params?.semantic) query.set("semantic", "true");
        if (params?.minScore) query.set("minScore", String(params.minScore));
        const res = await fetchWithRetry(`/api/videos?${query.toString()}`);
        if (!res.ok) throw new Error("Unable to load videos from the catalogue.");
        return await res.json();
      } catch (error) {
        throw error;
      }
    },

    async semanticSearch(q: string, minScore?: number) {
      return this.list({ q, semantic: true, minScore });
    },

    async upload(video: Record<string, unknown>) {
      const isMultipart = video.mediaFile instanceof File;
      const body = isMultipart
        ? (() => {
            const form = new FormData();
            Object.entries(video).forEach(([key, value]) => {
              if (key === "mediaFile" || value === undefined || value === null) return;
              form.append(key, Array.isArray(value) ? value.join(",") : String(value));
            });
            form.append("media", video.mediaFile as File, (video.mediaFile as File).name);
            return form;
          })()
        : JSON.stringify(video);
      const res = await fetchWithRetry("/api/videos", {
        method: "POST",
        ...(isMultipart ? {} : { headers: { "Content-Type": "application/json" } }),
        body,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || json.message || "Failed to publish video");
      }
      return json;
    },
  },

  ads: {
    async list(profile?: string) {
      try {
        const url = profile ? `/api/ads?profile=${encodeURIComponent(profile)}` : "/api/ads";
        const res = await fetchWithRetry(url);
        return res.ok ? await res.json() : { ads: [] };
      } catch (e) {
        console.warn("apiClient.ads.list error:", e);
        return { ads: [] };
      }
    },
  },

  telemetry: {
    async heartbeat(params: { userId?: string; pageRoute?: string; activeSeconds?: number; isTabFocused?: boolean }) {
      try {
        const payload = {
          eventId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : undefined,
          clientTimestamp: new Date().toISOString(),
          ...params,
        };
        await fetchWithRetry("/api/telemetry/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Non-blocking telemetry
      }
    },

    async playback(params: {
      userId?: string;
      videoId: string;
      category: string;
      eventType: string;
      positionSec: number;
      videoDurationSec: number;
      watchTimeSec: number;
      completionRate: number;
      isMuted?: boolean;
      isFullscreen?: boolean;
      isPip?: boolean;
      streamResolution?: string;
      osName?: string;
      networkType?: string;
      bufferingStalls?: number;
    }) {
      try {
        const payload = {
          eventId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : undefined,
          clientTimestamp: new Date().toISOString(),
          ...params,
        };
        await fetchWithRetry("/api/telemetry/playback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Non-blocking telemetry
      }
    },

    async feedImpressions(impressions: Array<{
      userId?: string;
      videoId: string;
      shelfContext?: string;
      positionIndex: number;
      dwellTimeMs: number;
      wasHovered?: boolean;
      clicked?: boolean;
    }>) {
      try {
        const enriched = impressions.map((imp) => ({
          eventId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : undefined,
          clientTimestamp: new Date().toISOString(),
          ...imp,
        }));
        await fetchWithRetry("/api/telemetry/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ impressions: enriched }),
        });
      } catch {
        // Non-blocking telemetry
      }
    },

    async adPlayback(params: {
      campaignId: string;
      userId?: string;
      videoId: string;
      adFormat?: string;
      skippedAtSec?: number | null;
      completed?: boolean;
      audioMuted?: boolean;
      viewabilityPercent?: number;
      causedChurn?: boolean;
    }) {
      try {
        const payload = {
          eventId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : undefined,
          clientTimestamp: new Date().toISOString(),
          ...params,
        };
        await fetchWithRetry("/api/telemetry/ad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Non-blocking telemetry
      }
    },

    async social(params: {
      userId?: string;
      videoId: string;
      eventType: string;
      metadata?: Record<string, unknown>;
    }) {
      try {
        await fetchWithRetry("/api/telemetry/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
      } catch {
        // Non-blocking telemetry
      }
    },
  },

  shop: {
    async getProducts(category?: string) {
      try {
        const url = category && category !== "all" ? `/api/shop?category=${encodeURIComponent(category)}` : "/api/shop";
        const res = await fetchWithRetry(url);
        if (!res.ok) throw new Error("Unable to load products.");
        return await res.json();
      } catch (e) {
        console.warn("apiClient.shop.getProducts error:", e);
        throw e;
      }
    },

    async getOrders() {
      try {
        const res = await fetchWithRetry("/api/shop?type=orders");
        if (!res.ok) throw new Error("Unable to load orders.");
        return await res.json();
      } catch (e) {
        console.warn("apiClient.shop.getOrders error:", e);
        throw e;
      }
    },

    async createOrder(order: { items: Array<{ productId: string; qty: number }> }) {
      const res = await fetchWithRetry("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_order", order }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to create order");
      }
      return json;
    },
  },

  channels: {
    async list() {
      try {
        const res = await fetchWithRetry("/api/channels", { cache: "no-store" });
        return res.ok
          ? await res.json()
          : { channels: [], maxLimit: 5, usedCount: 0, canCreate: true };
      } catch (e) {
        console.warn("apiClient.channels.list error:", e);
        return { channels: [], maxLimit: 5, usedCount: 0, canCreate: true };
      }
    },

    async create(data: {
      name: string;
      handle?: string;
      description?: string;
      category: string;
      subcategory?: string;
      avatar?: string;
    }) {
      const res = await fetchWithRetry("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to create channel");
      }
      return json;
    },

    async delete(channelId: string) {
      const res = await fetchWithRetry(`/api/channels?id=${encodeURIComponent(channelId)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete channel");
      }
      return json;
    },

    async setActive(channelId: string) {
      const res = await fetchWithRetry("/api/channels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to set active channel");
      }
      return json;
    },

    async update(channelId: string, updates: Record<string, unknown>) {
      const res = await fetchWithRetry("/api/channels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, ...updates }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to update channel");
      }
      return json;
    },
  },

  favourites: {
    async list(): Promise<string[]> {
      try {
        const res = await fetchWithRetry("/api/favourites", { cache: "no-store" });
        if (!res.ok) throw new Error("Unable to load favourites.");
        const data = await res.json();
        return data.favourites || [];
      } catch (error) {
        throw error;
      }
    },

    async add(videoId: string): Promise<boolean> {
      try {
        const res = await fetchWithRetry("/api/favourites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        return res.ok;
      } catch (e) {
        console.warn("apiClient.favourites.add error:", e);
        return false;
      }
    },

    async remove(videoId: string): Promise<boolean> {
      try {
        const res = await fetchWithRetry(`/api/favourites?videoId=${encodeURIComponent(videoId)}`, {
          method: "DELETE",
        });
        return res.ok;
      } catch (e) {
        console.warn("apiClient.favourites.remove error:", e);
        return false;
      }
    },
  },

  subscriptions: {
    async list(): Promise<Array<{ id: string }>> {
      const res = await fetchWithRetry("/api/subscriptions", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load subscriptions.");
      const data: { channels?: unknown } = await res.json();
      return Array.isArray(data.channels)
        ? data.channels.filter((channel): channel is { id: string } =>
            typeof channel === "object" && channel !== null && typeof (channel as { id?: unknown }).id === "string")
        : [];
    },

    async set(channelId: string, subscribed: boolean): Promise<boolean> {
      try {
        const res = await fetchWithRetry("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId, action: subscribed ? "subscribe" : "unsubscribe" }),
        });
        return res.ok;
      } catch (e) {
        console.warn("apiClient.subscriptions.set error:", e);
        return false;
      }
    },
  },

  history: {
    async list(): Promise<Array<{ videoId: string; category: string; totalWatchSeconds: number; progress: number; lastWatchedAt: string }>> {
      try {
        const res = await fetchWithRetry("/api/history", { cache: "no-store" });
        if (!res.ok) throw new Error("Unable to load watch history.");
        const data = await res.json();
        return data.history || [];
      } catch (error) {
        throw error;
      }
    },

    async clear(videoId?: string): Promise<boolean> {
      try {
        const url = videoId ? `/api/history?videoId=${encodeURIComponent(videoId)}` : "/api/history";
        const res = await fetchWithRetry(url, { method: "DELETE" });
        return res.ok;
      } catch (e) {
        console.warn("apiClient.history.clear error:", e);
        return false;
      }
    },
  },

  collaborations: {
    async list(): Promise<CollaborationRecord[]> {
      try {
        const res = await fetchWithRetry("/api/collaborations", { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        return data.collaborations || [];
      } catch (e) {
        console.warn("apiClient.collaborations.list error:", e);
        return [];
      }
    },

    async create(payload: {
      requesterChannelId: string;
      targetHandle: string;
      projectTitle: string;
      role: string;
      revenueSplit: string;
      note?: string;
    }): Promise<CollaborationRecord> {
      const res = await fetchWithRetry("/api/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to create collaboration request");
      }
      return data.collaboration;
    },

    async updateStatus(collabId: string, status: "accepted" | "declined" | "cancelled"): Promise<CollaborationRecord> {
      const res = await fetchWithRetry(`/api/collaborations?collabId=${encodeURIComponent(collabId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update collaboration status");
      }
      return data.collaboration;
    },
  },
};

import { Pool } from "pg";
import { randomUUID, createHash } from "node:crypto";

interface DatabaseError {
  code?: string;
}

const isDatabaseError = (value: unknown): value is DatabaseError =>
  typeof value === "object" && value !== null && "code" in value;

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const isDeployedEnvironment = !isBuildPhase && ["production", "staging"].includes(
  (process.env.OPENCONTENT_ENV ?? process.env.NODE_ENV ?? "development").toLowerCase()
);

function databaseSetting(name: string, localDefault: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (isDeployedEnvironment) {
    throw new Error(`Telemetry database configuration ${name} is required`);
  }
  return localDefault;
}

const PG_HOST = databaseSetting("DB_HOST", "127.0.0.1");
const PG_PORT = Number(databaseSetting("DB_PORT", "5432"));
const PG_USER = databaseSetting("DB_USER", "opencontent");
const PG_PASSWORD = databaseSetting("DB_PASS", "opencontent_dev");

// Dedicated connection pools for each telemetry bounded context
const sessionPool = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  user: PG_USER,
  password: PG_PASSWORD,
  database: "openconnect_session",
  max: 10,
  idleTimeoutMillis: 30000,
});

const behaviourPool = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  user: PG_USER,
  password: PG_PASSWORD,
  database: "openconnect_behaviour",
  max: 10,
  idleTimeoutMillis: 30000,
});

const interestPool = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  user: PG_USER,
  password: PG_PASSWORD,
  database: "openconnect_interest",
  max: 10,
  idleTimeoutMillis: 30000,
});

const adsPool = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  user: PG_USER,
  password: PG_PASSWORD,
  database: "openconnect_ads",
  max: 10,
  idleTimeoutMillis: 30000,
});

function parseEventId(id?: string | null): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim())) {
    return id.trim();
  }
  return randomUUID();
}

function parseUserId(id?: string | null): string | null {
  if (!id) return null;
  const clean = id.trim().toLowerCase();
  return /^[a-z0-9]{7}$/.test(clean) ? clean : null;
}

function parseSessionId(id?: string | null): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim())) {
    return id.trim();
  }
  return randomUUID();
}

/**
 * 1. Tracks User Activity & Active Dwell Time on the Platform
 * - P0 Contract: Durable Commit-Before-Ack (never acknowledge uncommitted events)
 * - Guest Isolation: Unauthenticated guests use high-entropy session_id with user_id = NULL
 */
export async function recordPlatformActivityHeartbeat(params: {
  eventId?: string;
  userId?: string | null;
  sessionId?: string | null;
  pageRoute: string;
  activeSeconds: number;
  isTabFocused: boolean;
  clientTimestamp?: string | number;
}) {
  const client = await sessionPool.connect();
  try {
    const eventId = parseEventId(params.eventId);
    const cleanUserId = parseUserId(params.userId);
    const sessionId = parseSessionId(params.sessionId);
    const activeSec = Math.max(1, Math.min(params.activeSeconds || 30, 300));
    const isFocused = params.isTabFocused ?? true;
    const pageRoute = params.pageRoute || "/";

    // 1. Compute canonical payload hash on server (never trust client-supplied hash)
    const canonicalPayload = JSON.stringify({
      sessionId,
      userId: cleanUserId,
      pageRoute,
      activeSeconds: activeSec,
      isTabFocused: isFocused,
    });
    const payloadHash = createHash("sha256").update(canonicalPayload).digest("hex");

    // 2. Insert heartbeat with idempotent event_id dedup and durable WAL commit
    try {
      await client.query(
        `INSERT INTO session_activity_heartbeats (
          event_id, payload_hash, session_id, user_id, page_route, active_seconds, is_tab_focused, client_timestamp, server_received_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)`,
        [eventId, payloadHash, sessionId, cleanUserId, pageRoute, activeSec, isFocused, params.clientTimestamp ? new Date(params.clientTimestamp) : null]
      );
    } catch (insertErr: unknown) {
      if (isDatabaseError(insertErr) && insertErr.code === "23505") { // unique_violation on event_id
        const existing = await client.query(
          `SELECT payload_hash FROM session_activity_heartbeats WHERE event_id = $1`,
          [eventId]
        );
        if (existing.rows.length > 0 && existing.rows[0].payload_hash === payloadHash) {
          return { ok: true, status: 200, duplicateAcknowledged: true, message: "duplicate_acknowledged", eventId, activeSeconds: activeSec, isDurable: true };
        }
        return { ok: false, status: 409, conflict: true, error: "409 Conflict: event_id already exists with a different payload", eventId };
      }
      throw insertErr;
    }

    // 3. Upsert daily dwell time ONLY for authenticated accounts
    if (cleanUserId) {
      await client.query(
        `INSERT INTO user_platform_dwell_daily (
          user_id, activity_date, total_time_spent_sec, total_sessions_count, last_active_at
        ) VALUES ($1, CURRENT_DATE, $2, 1, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, activity_date) DO UPDATE SET
          total_time_spent_sec = user_platform_dwell_daily.total_time_spent_sec + EXCLUDED.total_time_spent_sec,
          last_active_at = CURRENT_TIMESTAMP`,
        [cleanUserId, activeSec]
      );
    }

    return { ok: true, status: 200, activeSeconds: activeSec, eventId, isDurable: true };
  } catch (err) {
    console.warn("[telemetry] session activity heartbeat error:", err);
    return { ok: false, status: 500, error: String(err) };
  } finally {
    client.release();
  }
}

/**
 * 2. Tracks Video Playback Behavior & Content Affinity
 * - High-throughput append-only playback events in openconnect_behaviour
 * - Computes user category affinity in openconnect_interest (what content user likes)
 * - Enables contextual and behavioral ad matching
 */
export async function recordPlaybackTelemetry(params: {
  eventId?: string;
  userId?: string | null;
  sessionId?: string | null;
  videoId: string;
  category: string;
  eventType: "play" | "pause" | "seek" | "heartbeat" | "complete" | "skip" | "buffering" | "speed_change";
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
  clientTimestamp?: string | number;
}) {
  const bClient = await behaviourPool.connect();
  const iClient = await interestPool.connect();

  try {
    const eventId = parseEventId(params.eventId);
    const cleanUserId = parseUserId(params.userId);
    const sessionId = parseSessionId(params.sessionId);
    const category = params.category?.trim() || "Generic";
    const watchSec = Math.max(0, params.watchTimeSec || 0);
    const completion = Math.max(0, Math.min(params.completionRate || 0, 100));

    // 1. Compute canonical payload hash on server (never trust client-supplied hash)
    const canonicalPayload = JSON.stringify({
      userId: cleanUserId,
      sessionId,
      videoId: params.videoId,
      eventType: params.eventType,
      positionSec: params.positionSec || 0,
      watchTimeSec: watchSec,
      completionRate: completion,
    });
    const payloadHash = createHash("sha256").update(canonicalPayload).digest("hex");

    // 2. Record playback event in openconnect_behaviour with trust boundary & idempotency
    try {
      await bClient.query(
        `INSERT INTO playback_events (
          event_id, payload_hash, schema_version, user_id, session_id, video_id, event_type, position_sec,
          video_duration_sec, watch_time_sec, completion_rate, is_muted, is_fullscreen,
          is_pip, stream_resolution, os_name, network_type, buffering_stalls, client_timestamp, server_received_at
        ) VALUES ($1, $2, '1.0', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, COALESCE($18, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)`,
        [
          eventId,
          payloadHash,
          cleanUserId,
          sessionId,
          params.videoId,
          params.eventType,
          params.positionSec || 0,
          params.videoDurationSec || 0,
          watchSec,
          completion,
          params.isMuted ?? false,
          params.isFullscreen ?? false,
          params.isPip ?? false,
          params.streamResolution || "1080p",
          params.osName || "unknown",
          params.networkType || "wifi",
          params.bufferingStalls || 0,
          params.clientTimestamp ? new Date(params.clientTimestamp) : null,
        ]
      );
    } catch (insertErr: unknown) {
      if (isDatabaseError(insertErr) && insertErr.code === "23505") { // unique_violation on event_id
        const existing = await bClient.query(
          `SELECT payload_hash FROM playback_events WHERE event_id = $1`,
          [eventId]
        );
        if (existing.rows.length > 0 && existing.rows[0].payload_hash === payloadHash) {
          return { ok: true, status: 200, duplicateAcknowledged: true, message: "duplicate_acknowledged", eventId, isDurable: true };
        }
        return { ok: false, status: 409, conflict: true, error: "409 Conflict: event_id already exists with a different payload", eventId };
      }
      throw insertErr;
    }

    // 2. Upsert user video engagement summary ONLY for authenticated accounts
    if (cleanUserId) {
      const isCompleted = completion >= 90;
      const isQuickSkip = params.eventType === "skip" && (params.positionSec || 0) < 10;
      await bClient.query(
        `INSERT INTO user_video_engagement_summary (
          user_id, video_id, category, total_watch_seconds, total_play_sessions,
          max_completion_rate, fully_completed, quick_skipped, last_watched_at
        ) VALUES ($1, $2, $3, $4, 1, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, video_id) DO UPDATE SET
          total_watch_seconds = user_video_engagement_summary.total_watch_seconds + EXCLUDED.total_watch_seconds,
          max_completion_rate = GREATEST(user_video_engagement_summary.max_completion_rate, EXCLUDED.max_completion_rate),
          fully_completed = user_video_engagement_summary.fully_completed OR EXCLUDED.fully_completed,
          quick_skipped = user_video_engagement_summary.quick_skipped OR EXCLUDED.quick_skipped,
          last_watched_at = CURRENT_TIMESTAMP`,
        [cleanUserId, params.videoId, category, watchSec, completion, isCompleted, isQuickSkip]
      );

      // 3. Update User Interest & Content Affinity in openconnect_interest
      const affinityBoost = Number((watchSec * 0.05 + (isCompleted ? 2.0 : 0.0)).toFixed(2));
      await iClient.query(
        `INSERT INTO user_category_affinities (
          user_id, category, affinity_score, watch_time_weight, last_interaction_at
        ) VALUES ($1, $2, GREATEST(1.0, $3), $4, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, category) DO UPDATE SET
          affinity_score = user_category_affinities.affinity_score + EXCLUDED.affinity_score,
          watch_time_weight = user_category_affinities.watch_time_weight + EXCLUDED.watch_time_weight,
          last_interaction_at = CURRENT_TIMESTAMP`,
        [cleanUserId, category, affinityBoost, watchSec]
      );
    }

    return { ok: true, eventId, isDurable: true };
  } catch (err) {
    console.warn("[telemetry] playback telemetry error:", err);
    return { ok: false, error: String(err) };
  } finally {
    bClient.release();
    iClient.release();
  }
}

/**
 * 3. Batch Negative Signal Collection: Feed Impressions (What the user SAW but did NOT click)
 * High volume bulk insert into openconnect_behaviour.feed_impression_events with idempotency
 */
export async function recordFeedImpressionsBatch(
  impressions: Array<{
    eventId?: string;
    userId: string;
    sessionId?: string | null;
    videoId: string;
    shelfContext?: string;
    positionIndex: number;
    dwellTimeMs: number;
    wasHovered?: boolean;
    clicked?: boolean;
    clientTimestamp?: string | number;
  }>
) {
  if (!impressions || impressions.length === 0) return { ok: true, count: 0 };
  const client = await behaviourPool.connect();
  try {
    const values: unknown[] = [];
    const placeholders: string[] = [];

    impressions.forEach((imp, idx) => {
      const offset = idx * 10;
      placeholders.push(
        `($${offset + 1}, '1.0', $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, COALESCE($${offset + 10}, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)`
      );
      values.push(
        parseEventId(imp.eventId),
        imp.userId?.trim().slice(0, 32) || "anon",
        imp.sessionId || null,
        imp.videoId,
        imp.shelfContext || "home_feed",
        Math.max(0, imp.positionIndex || 0),
        Math.max(0, imp.dwellTimeMs || 1000),
        imp.wasHovered ?? false,
        imp.clicked ?? false,
        imp.clientTimestamp ? new Date(imp.clientTimestamp) : null
      );
    });

    await client.query(
      `INSERT INTO feed_impression_events (
        event_id, schema_version, user_id, session_id, video_id, shelf_context, position_index, dwell_time_ms, was_hovered, clicked, client_timestamp, server_received_at
      ) VALUES ${placeholders.join(", ")}
      ON CONFLICT (event_id) DO NOTHING`,
      values
    );

    return { ok: true, count: impressions.length };
  } catch (err) {
    console.warn("[telemetry] batch feed impressions error:", err);
    return { ok: false, error: String(err) };
  } finally {
    client.release();
  }
}

/**
 * 4. Social & Transactional Intent Telemetry
 * High-value advertiser signals (WhatsApp share, link copy, buy link click)
 */
export async function recordSocialEngagementEvent(params: {
  userId: string;
  sessionId?: string | null;
  videoId: string;
  eventType: "share_whatsapp" | "share_copy_link" | "share_twitter" | "buy_link_click" | "comments_expanded";
  metadata?: Record<string, unknown>;
}) {
  const client = await behaviourPool.connect();
  try {
    const cleanUserId = params.userId?.trim().slice(0, 32) || "anon";
    await client.query(
      `INSERT INTO social_engagement_events (
        user_id, session_id, video_id, event_type, metadata
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        cleanUserId,
        params.sessionId || null,
        params.videoId,
        params.eventType,
        JSON.stringify(params.metadata || {}),
      ]
    );
    return { ok: true };
  } catch (err) {
    console.warn("[telemetry] social engagement error:", err);
    return { ok: false, error: String(err) };
  } finally {
    client.release();
  }
}

/**
 * 5. Granular Ad Playback & IAB Viewability Telemetry (YouTube-Grade Ad Signals)
 * Records exact skip second, completion rate, audio mute state, viewability, churn
 */
export async function recordAdPlaybackTelemetry(params: {
  eventId?: string;
  campaignId: string;
  userId: string;
  sessionId?: string | null;
  videoId: string;
  adFormat?: "preroll" | "midroll" | "banner" | "overlay";
  skippedAtSec?: number | null;
  completed?: boolean;
  audioMuted?: boolean;
  viewabilityPercent?: number;
  causedChurn?: boolean;
  clientTimestamp?: string | number;
}) {
  const client = await adsPool.connect();
  try {
    const eventId = parseEventId(params.eventId);
    const cleanUserId = params.userId?.trim().slice(0, 32) || "anon";
    await client.query(
      `INSERT INTO ad_playback_telemetry (
        event_id, campaign_id, user_id, session_id, video_id, ad_format,
        skipped_at_sec, completed, audio_muted, viewability_percent, caused_churn,
        client_timestamp, server_received_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)
      ON CONFLICT (event_id) DO NOTHING`,
      [
        eventId,
        params.campaignId,
        cleanUserId,
        params.sessionId || null,
        params.videoId,
        params.adFormat || "preroll",
        params.skippedAtSec !== undefined ? params.skippedAtSec : null,
        params.completed ?? false,
        params.audioMuted ?? false,
        params.viewabilityPercent ?? 100.0,
        params.causedChurn ?? false,
        params.clientTimestamp ? new Date(params.clientTimestamp) : null,
      ]
    );
    return { ok: true, eventId };
  } catch (err) {
    console.warn("[telemetry] ad playback telemetry error:", err);
    return { ok: false, error: String(err) };
  } finally {
    client.release();
  }
}

/**
 * 6. Retrieves Normalized User Interest Category for Targeted Ad Serving
 * - Returns user's primary category based on watch time & search queries
 * - Used by Ad Decision Server to publish relevant targeted ads (similar to YouTube)
 */
export async function getUserTargetingCategory(userId: string): Promise<string | null> {
  if (!userId) return null;
  const client = await interestPool.connect();
  try {
    const res = await client.query(
      `SELECT primary_category FROM user_interest_semantic_profiles WHERE user_id = $1
       UNION ALL
       SELECT category FROM user_category_affinities WHERE user_id = $1 ORDER BY affinity_score DESC LIMIT 1`,
      [userId]
    );
    if (res.rows.length > 0 && res.rows[0].primary_category) {
      return res.rows[0].primary_category;
    }
    return null;
  } catch {
    return null;
  } finally {
    client.release();
  }
}

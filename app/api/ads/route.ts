import { NextRequest, NextResponse } from "next/server";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { AdSimulation } from "@/types";
import { getUserTargetingCategory } from "@/lib/server/telemetry";
import { getActiveSession } from "@/lib/server/auth";
import { serviceUrl } from "@/lib/services/config";

const ADS_SERVICE_URL = serviceUrl("ads");

/**
 * Opencontent Ad Decision Server (ADS) — Production-Grade BFF Route
 * -----------------------------------------------------------------
 * Architecture:
 * - Frontend: Next.js (React) Edge BFF
 * - Backend: Go Microservice (:8090) with Real-Time Bidding Auction & Telemetry
 * - Database: PostgreSQL (openconnect_ads) with campaign targeting & impression logs
 *
 * Capabilities:
 * 1. RTB Ad Decisioning: Queries Go microservice for highest-CPM targeted ads from PostgreSQL
 * 2. Privacy-Preserving Viewer Anonymization: Zero PII stored (SHA-256 salted hash)
 * 3. Telemetry Tracking: POST impressions & clicks with bot fraud detection
 * 4. High-Performance Edge Caching: ETag (304 Not Modified) + stale-while-revalidate
 * 5. High-Availability: Resilient circuit breaker with timeout and graceful error reporting
 */

interface AdCampaignWithToken extends AdSimulation {
  trackingToken?: string;
  impressionUrl?: string;
  clickUrl?: string;
  spentInr?: number;
  impressionsCount?: number;
  clicksCount?: number;
  active?: boolean;
}

interface GoDecisionResponse {
  ads: AdCampaignWithToken[];
  auctionId: string;
  timestamp: number;
  totalBids: number;
}

/** Compute an anonymous viewer hash from headers (zero PII storage) */
function getViewerHash(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const salt = "opencontent-viewer-privacy-salt";
  return createHash("sha256")
    .update(`${salt}:${ip}:${userAgent}`)
    .digest("hex")
    .slice(0, 16);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    // Operational advertising analytics are not a public product surface.
    // There is no verified advertiser/admin role in the current session model,
    // so do not use the internal caller token as a substitute for user-level
    // authorization. Keep this endpoint unavailable until that role boundary
    // exists.
    if (view === "analytics" || view === "stats") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // 1. Extract context parameters for targeting
    const profileParam =
      searchParams.get("profile") ||
      searchParams.get("ageProfile") ||
      "all";
    const categoryParam = searchParams.get("category") || "";
    const placementParam = searchParams.get("placement") || "feed";
    const limitParam = parseInt(searchParams.get("limit") || "3", 10);
    const viewerHash = getViewerHash(request);

    // Behavioral & Interest Ad Targeting: Look up user's primary content affinity from openconnect_interest
    // Targeting assertions may only be minted for a verified server session.
    // Query parameters and browser-controlled account cookies are not identity
    // credentials and must never select another user's affinity profile.
    const session = await getActiveSession(request);
    const userId = session?.userId;
    let targetCategory = categoryParam;
    if (!targetCategory && userId) {
      const affinityCategory = await getUserTargetingCategory(userId);
      if (affinityCategory) {
        targetCategory = affinityCategory;
      }
    }

    // 2. Query Go Ad Decision Microservice (:8090) -> queries PostgreSQL openconnect_ads
    const goUrl = new URL(`${ADS_SERVICE_URL}/ads/decision`);
    goUrl.searchParams.set("placement", placementParam);
    if (targetCategory) goUrl.searchParams.set("category", targetCategory);
    if (profileParam) goUrl.searchParams.set("age_profile", profileParam);
    goUrl.searchParams.set("viewer_hash", viewerHash);
    goUrl.searchParams.set("limit", String(limitParam));

    let ads: AdCampaignWithToken[] = [];
    let auctionId: string | null = null;
    let totalBids = 0;

    // Gateway Security: strip client supplied identity credentials. The BFF
    // sends a short-lived assertion only for the verified session above.
    const forwardHeaders: Record<string, string> = {
      Accept: "application/json",
      "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
    };

    const ageToken = request.headers.get("x-age-assurance-token");
    if (ageToken) forwardHeaders["X-Age-Assurance-Token"] = ageToken;

    // If server session is authenticated, mint a short-lived, replay-resistant Gateway Assertion
    // Claims: iss=opencontent-gateway, aud=opencontent-ads-decision, sub, iat, exp, jti (nonce)
    if (userId && process.env.GATEWAY_SHARED_SECRET) {
      const now = Math.floor(Date.now() / 1000);
      const exp = now + 60; // 60-second validity window
      const jti = randomUUID();
      const payload = `gw:opencontent-gateway:opencontent-ads-decision:${userId}:${now}:${exp}:${jti}`;
      const sig = createHmac("sha256", process.env.GATEWAY_SHARED_SECRET)
        .update(payload)
        .digest("hex");
      forwardHeaders["X-Gateway-Assertion"] = `${Buffer.from(payload).toString("hex")}:${exp}:${sig}`;
    }

    const goResponse = await fetch(goUrl.toString(), {
      method: "GET",
      headers: forwardHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (goResponse.ok) {
      const data = (await goResponse.json()) as GoDecisionResponse;
      ads = data.ads || [];
      auctionId = data.auctionId || null;
      totalBids = data.totalBids;
    } else {
      console.warn(`[ads-bff] Go ADS service returned ${goResponse.status}`);
    }

    // 3. ETag & Conditional GET (304 Not Modified) for production edge performance
    const responseBody = {
      ads,
      auction: {
        id: auctionId,
        placement: placementParam,
        ageProfile: profileParam,
        bidsCount: totalBids,
      },
    };

    // 3. Deterministic ETag & Conditional GET (304 Not Modified) for edge caching
    const campaignFingerprint = ads
      .map((a) => `${a.id}:${a.cpm}:${a.impressionsCount}:${a.clicksCount}:${a.active}`)
      .join(";");
    const etag = `W/"${createHash("sha256")
      .update(`${campaignFingerprint}:${placementParam}:${profileParam}`)
      .digest("hex")
      .slice(0, 24)}"`;

    if (request.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=15, s-maxage=30, stale-while-revalidate=60",
        },
      });
    }

    const serialized = JSON.stringify(responseBody);


    return new NextResponse(serialized, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ETag: etag,
        "Cache-Control": "public, max-age=15, s-maxage=30, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/ads error:", error);
    return NextResponse.json(
      {
        ads: [],
        error: "Advertising is temporarily unavailable.",
      },
      { status: 503 }
    );
  }
}

/** Telemetry Endpoint for Ad Impressions & Clicks (persists to PostgreSQL) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "impression";
    const token = body.token;

    if (!token) {
      return NextResponse.json(
        { error: "missing_token", message: "Ad tracking token is required" },
        { status: 400 }
      );
    }

    const viewerHash = getViewerHash(request);
    const targetEndpoint =
      action === "click"
        ? `${ADS_SERVICE_URL}/ads/click`
        : `${ADS_SERVICE_URL}/ads/impression`;

    const response = await fetch(targetEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        viewerHash,
        botScore: body.botScore || 0,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "telemetry_rejected", status: response.status },
      { status: response.status }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "telemetry_failed", message: String(err) },
      { status: 500 }
    );
  }
}

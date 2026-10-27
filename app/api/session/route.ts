import { NextRequest, NextResponse } from "next/server";
import { resolveAccount } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";
import {
  getRecentSessions,
  getSessionStats,
  updateSessionSignals,
} from "../../../lib/server/session";
import {
  ValidationError,
  optionalString,
} from "../../../lib/server/validation";

const DEVICE_CLASSES = new Set(["mobile", "tablet", "laptop", "desktop"]);
const BOT_VERDICTS = new Set([
  "likely_human",
  "needs_verification",
  "likely_automated",
]);
const COUNTRY_CODE = /^[A-Z]{2}$/;

export async function GET(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const [stats, recent, active] = await Promise.all([
      getSessionStats(account.id),
      getRecentSessions(account.id, 5),
      getActiveSession(request),
    ]);
    const signedIn = Boolean(active && active.accountId === account.id);
    return NextResponse.json({
      signedIn,
      activeSessionId: signedIn ? active?.id ?? null : null,
      stats,
      recent: recent.map((session) => ({
        id: session.id,
        userId: session.userId,
        signedIn: session.signedIn,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        endedAt: session.endedAt,
        lastSeenAt: session.lastSeenAt,
        countryCode: session.countryCode,
        timezone: session.timezone,
        deviceClass: session.deviceClass,
        browser: session.browser,
      })),
    });
  } catch (error) {
    console.error("GET /api/session failed", error);
    return NextResponse.json(
      { error: "session_unavailable" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const active = await getActiveSession(request);
    if (!active) {
      return NextResponse.json(
        { error: "not_signed_in", message: "Start a session to continue." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    if (!body) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const countryCode =
      body.countryCode === null || body.countryCode === undefined
        ? null
        : typeof body.countryCode === "string" &&
            COUNTRY_CODE.test(body.countryCode)
          ? body.countryCode
          : (() => {
              throw new ValidationError("countryCode must be ISO-3166 alpha-2");
            })();

    const timezone = optionalString(body.timezone, "Timezone", 64);
    const browser = optionalString(body.browser, "Browser", 80);
    const deviceClass =
      body.deviceClass === null || body.deviceClass === undefined
        ? null
        : typeof body.deviceClass === "string" &&
            DEVICE_CLASSES.has(body.deviceClass)
          ? body.deviceClass
          : (() => {
              throw new ValidationError("deviceClass is not recognised");
            })();

    const botVerdict =
      body.botVerdict === null || body.botVerdict === undefined
        ? null
        : typeof body.botVerdict === "string" &&
            BOT_VERDICTS.has(body.botVerdict)
          ? body.botVerdict
          : (() => {
              throw new ValidationError("botVerdict is not recognised");
            })();

    let botScore: number | null = null;
    if (body.botScore !== null && body.botScore !== undefined) {
      if (
        typeof body.botScore !== "number" ||
        !Number.isInteger(body.botScore) ||
        body.botScore < 0 ||
        body.botScore > 100
      ) {
        throw new ValidationError("botScore must be an integer from 0 to 100");
      }
      botScore = body.botScore;
    }

    const session = await updateSessionSignals(active.id, {
      countryCode,
      timezone,
      deviceClass,
      browser,
      botScore,
      botVerdict,
    });
    if (!session) {
      return NextResponse.json(
        { error: "session_not_found" },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true, signedIn: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "validation_error", message: error.message },
        { status: error.status }
      );
    }
    console.error("POST /api/session failed", error);
    return NextResponse.json(
      { error: "session_record_failed" },
      { status: 500 }
    );
  }
}

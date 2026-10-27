import { NextRequest, NextResponse } from "next/server";
import { resolveAccount } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";

const DISLIKES_SERVICE_URL = process.env.DISLIKES_SERVICE_URL ?? "http://127.0.0.1:8087";
const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN;

function internalHeaders(): Headers {
  if (!INTERNAL_AUTH_TOKEN) throw new Error("Dislikes internal service token is not configured");
  return new Headers({ "X-OpenContent-Service-Token": INTERNAL_AUTH_TOKEN });
}

export async function GET(request: NextRequest) {
  const videoId = new URL(request.url).searchParams.get("videoId");
  if (!videoId) return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  const { account } = await resolveAccount(request);
  const session = await getActiveSession(request);
  const url = new URL(`${DISLIKES_SERVICE_URL}/dislikes`);
  url.searchParams.set("videoId", videoId);
  if (session?.accountId === account.id) url.searchParams.set("userId", session.userId);
  const response = await fetch(url, { headers: session?.accountId === account.id ? internalHeaders() : undefined, cache: "no-store" });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { videoId?: unknown } | null;
  if (typeof body?.videoId !== "string" || !body.videoId) return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  const { account } = await resolveAccount(request);
  const session = await getActiveSession(request);
  if (!session || session.accountId !== account.id) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const response = await fetch(`${DISLIKES_SERVICE_URL}/dislikes`, {
    method: "POST", headers: new Headers({ ...Object.fromEntries(internalHeaders()), "Content-Type": "application/json" }),
    body: JSON.stringify({ videoId: body.videoId, userId: session.userId }),
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

import { NextRequest } from "next/server";
import { resolveAccount } from "../../../../lib/server/accounts";
import { getActiveSession } from "../../../../lib/server/auth";

const VIDEOS_SERVICE_URL = process.env.VIDEOS_SERVICE_URL ?? "http://127.0.0.1:8091";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { account } = await resolveAccount(request);
  const session = await getActiveSession(request);
  const upstream = await fetch(`${VIDEOS_SERVICE_URL}/media/${encodeURIComponent(id)}`, {
    headers: {
      Range: request.headers.get("range") ?? "",
      "X-OpenContent-User": session?.accountId === account.id ? account.publicId : "",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });
  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

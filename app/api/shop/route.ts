import { NextRequest, NextResponse } from "next/server";
import { resolveAccount, attachAccountCookie } from "../../../lib/server/accounts";
import { getActiveSession } from "../../../lib/server/auth";
import { serviceUrl } from "../../../lib/services/config";

const SHOP_SERVICE_URL = serviceUrl("shop");
const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN;
function shopHeaders(userId: string, contentType = false): Headers {
  if (!INTERNAL_AUTH_TOKEN) throw new Error("Shop internal service token is not configured");
  const headers = new Headers({ "X-User-ID": userId, "X-OpenContent-Service-Token": INTERNAL_AUTH_TOKEN });
  if (contentType) headers.set("Content-Type", "application/json");
  return headers;
}

interface ShopOrderRecord { id: string; userId: string; total: number | string; status: string; createdAt?: string; items?: unknown[]; }
interface ShopProductRecord { id: string; name: string; seller: string; category: string; price: number | string; mrp?: number | string; rating?: number | string; reviews?: number | string; image?: string; badge?: string; format?: string; }
interface OrderItemInput { productId?: unknown; qty?: unknown; }
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export async function GET(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "products" | "orders"

    if (type === "orders") {
      const session = await getActiveSession(request);
      if (!session || session.accountId !== account.id) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
      const res = await fetch(`${SHOP_SERVICE_URL}/orders?userId=${encodeURIComponent(session.userId)}`, {
        headers: shopHeaders(session.userId),
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: "Shop service failed to fetch orders" },
          { status: res.status }
        );
      }

      const data: { orders?: unknown } = await res.json();
      const orders = (Array.isArray(data.orders) ? data.orders : []).filter((value): value is ShopOrderRecord => isRecord(value) && typeof value.id === "string" && typeof value.userId === "string" && typeof value.status === "string" && (typeof value.total === "string" || typeof value.total === "number")).map((r) => ({
        id: r.id,
        userId: r.userId,
        total: Number(r.total) || 0,
        status: r.status,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "Recent",
        items: r.items || [],
      }));

      const response = NextResponse.json({ orders });
      return attachAccountCookie(response, account.id);
    }

    const category = searchParams.get("category") || "all";
    const res = await fetch(
      `${SHOP_SERVICE_URL}/products?category=${encodeURIComponent(category)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Shop service failed to fetch products" },
        { status: res.status }
      );
    }

    const data: { products?: unknown } = await res.json();
    const products = (Array.isArray(data.products) ? data.products : []).filter((value): value is ShopProductRecord => isRecord(value) && typeof value.id === "string" && typeof value.name === "string" && typeof value.seller === "string" && typeof value.category === "string" && (typeof value.price === "string" || typeof value.price === "number")).map((r) => ({
      id: r.id,
      name: r.name,
      seller: r.seller,
      category: r.category,
      price: Number(r.price) || 0,
      mrp: r.mrp ? Number(r.mrp) : undefined,
      rating: Number(r.rating) || 5.0,
      reviews: Number(r.reviews) || 0,
      image: r.image,
      badge: r.badge || undefined,
      format: r.format || "Physical",
    }));

    const response = NextResponse.json({ products });
    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("GET /api/shop gateway error:", error);
    return NextResponse.json(
      { error: "Shop microservice unavailable" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { account } = await resolveAccount(request);
    const session = await getActiveSession(request);
    if (!session || session.accountId !== account.id) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    const body: unknown = await request.json().catch(() => ({}));
    const items = isRecord(body) ? body.items : undefined;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required to place an order" },
        { status: 400 }
      );
    }

    const res = await fetch(`${SHOP_SERVICE_URL}/orders`, {
      method: "POST",
      headers: shopHeaders(session.userId, true),
      // The shop service owns product lookup and all price calculation.
      body: JSON.stringify({
        items: items.filter((item): item is OrderItemInput => isRecord(item)).map((item) => ({
          productId: String(item.productId || ""),
          qty: Number(item.qty),
        })),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || "Failed to create order in shop service" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const order = data.order;
    const response = NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        userId: order.userId,
        total: order.total,
        status: order.status,
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "",
        items: order.items,
      },
    });

    return attachAccountCookie(response, account.id);
  } catch (error) {
    console.error("POST /api/shop gateway error:", error);
    return NextResponse.json(
      { error: "Shop microservice unavailable" },
      { status: 502 }
    );
  }
}

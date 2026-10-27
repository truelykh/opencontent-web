"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useEffect, useMemo, useState } from "react";
import {
  StorefrontRounded as Store,
  ShoppingBagRounded as ShoppingBag,
  ShoppingCartRounded as ShoppingCart,
  Inventory2Rounded as Package,
  StarRounded as Star,
  LocalShippingRounded as Truck,
  AddRounded as Plus,
  RemoveRounded as Minus,
  CloseRounded as X,
  CheckRounded as Check,
  VerifiedUserRounded as ShieldCheck,
  CreditCardRounded as CreditCard,
  ReceiptLongRounded as ReceiptText,
  ArrowForwardRounded as ArrowRight,
} from "@mui/icons-material";
import {
  ShopCategory,
  ShopOrder,
  ShopProduct,
  ShopSubTab,
} from "@/types";
import { apiClient } from "@/lib/apiClient";
import HorizontalPageHeader from "../common/HorizontalPageHeader";

interface ShopViewProps {
  activeTab: ShopSubTab;
  onTabChange: (tab: ShopSubTab) => void;
  onToast: (message: string) => void;
}

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const CATEGORY_LABEL: Record<ShopCategory, string> = {
  merch: "Creator merch",
  digital: "Digital download",
  learning: "Course",
};

const ORDER_STATUS: Record<
  ShopOrder["status"],
  { label: string; className: string }
> = {
  delivered: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  shipped: {
    label: "In transit",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  processing: {
    label: "Processing",
    className: "bg-[#FFF7ED] text-[#FF9933] border-[#FED7AA]",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function ShopView({
  activeTab,
  onTabChange,
  onToast,
}: ShopViewProps) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<"all" | ShopCategory>("all");
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiClient.shop.getProducts(),
      apiClient.shop.getOrders(),
    ])
      .then(([productsRes, ordersRes]) => {
        if (!isMounted) return;
        if (productsRes?.products && Array.isArray(productsRes.products)) {
          setProducts(productsRes.products);
        }
        if (ordersRes?.orders && Array.isArray(ordersRes.orders)) {
          setOrders(ordersRes.orders);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("ShopView data fetch error:", err);
        setError("Unable to load store data from server.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: productMap.get(id), qty }))
        .filter(
          (line): line is { product: ShopProduct; qty: number } =>
            Boolean(line.product)
        ),
    [cart, productMap]
  );

  const cartCount = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = cartLines.reduce(
    (sum, line) => sum + line.product.price * line.qty,
    0
  );
  // This is an estimate from the currently displayed catalogue. The server
  // re-prices every line before it creates an order request.
  const total = subtotal;

  const filters: { id: "all" | ShopCategory; label: string }[] = [
    { id: "all", label: "All products" },
    { id: "merch", label: "Merch" },
    { id: "digital", label: "Digital downloads" },
    { id: "learning", label: "Courses" },
  ];

  const visibleProducts =
    category === "all"
      ? products
      : products.filter((product) => product.category === category);

  const addToCart = (product: ShopProduct) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
    onToast(`${product.name} added to your cart.`);
  };

  const decrement = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const qty = next[id] ?? 0;
      if (qty <= 1) delete next[id];
      else next[id] = qty - 1;
      return next;
    });
  };

  const increment = (id: string) =>
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  const removeLine = (id: string) =>
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const handleCheckout = async () => {
    if (cartLines.length === 0) return;
    try {
      setIsSubmitting(true);
      const res = await apiClient.shop.createOrder({
        items: cartLines.map((l) => ({ productId: l.product.id, qty: l.qty })),
      });
      if (res?.order) {
        setOrders((prev) => [res.order, ...prev]);
        setCart({});
        onToast("Order request created. Payment and fulfilment are not available in this installation.");
        onTabChange("orders");
      }
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : "Failed to complete checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ordersInTransit = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  ).length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <HorizontalPageHeader
        icon={Store}
        title="Shop"
        description="Discover products and manage your purchases."
      />

      {/* Tabs + category filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Shop sections"
          className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-white p-1 shadow-xs"
        >
          {(
            [
              { id: "store", label: "Openstore", icon: ShoppingBag },
              { id: "orders", label: "My Orders", icon: Package },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] transition-colors ${
                  isActive
                    ? "font-bold text-[#FF9933] bg-transparent"
                    : "font-semibold text-[#64748B] hover:text-[#334155]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? "text-[#FF9933]" : "text-[#94A3B8]"
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "store" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((filter) => {
              const isActive = category === filter.id;
              const count =
                filter.id === "all"
                  ? products.length
                  : products.filter((p: ShopProduct) => p.category === filter.id).length;
              return (
                <button
                  key={filter.id}
                  onClick={() => setCategory(filter.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    isActive
                      ? "border-[#CBD5E1] bg-transparent font-bold text-[#FF9933]"
                      : "border-[#E2E8F0] bg-white font-semibold text-[#64748B] hover:border-[#CBD5E1] hover:text-[#334155]"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-1.5 text-[9.5px] font-bold tabular-nums ${
                      isActive
                        ? "bg-[#FF9933] text-white"
                        : "bg-[#F1F5F9] text-[#94A3B8]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {activeTab === "store" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Product grid */}
          {isLoading ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center shadow-xs">
              <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-[#CBD5E1] animate-pulse" />
              <h3 className="text-sm font-bold text-[#334155]">Loading Openstore catalog...</h3>
              <p className="mt-1 text-xs text-[#64748B]">Querying verified creator merchandise and digital assets.</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-xs">
              <p className="text-sm font-bold">{error}</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center shadow-xs">
              <Store className="mx-auto mb-3 h-10 w-10 text-[#CBD5E1]" />
              <h3 className="text-sm font-bold text-[#334155]">No products found</h3>
              <p className="mt-1 text-xs text-[#64748B]">No creator products are currently listed in this category.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {visibleProducts.map((product) => {
              const qty = cart[product.id] ?? 0;
              const discount = product.mrp
                ? Math.round((1 - product.price / product.mrp) * 100)
                : 0;
              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6F00]/40 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-22px_rgba(15,23,42,0.35)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F1F5F9]">
                    <ContentImage
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-[#FF6F00] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white shadow-sm">
                        {product.badge}
                      </span>
                    )}
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-semibold text-[#475569] backdrop-blur">
                      {product.format}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-[#FF6F00]">
                      {CATEGORY_LABEL[product.category]}
                      <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
                      <span className="truncate normal-case font-medium tracking-normal text-[#94A3B8]">
                        {product.seller}
                      </span>
                    </div>

                    <h3
                      title={product.name}
                      className="mt-1.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[#334155]"
                    >
                      {product.name}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1 text-[10.5px] text-[#64748B]">
                      <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="font-bold text-[#334155]">
                        {product.rating}
                      </span>
                      <span>({product.reviews})</span>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[15px] font-black text-[#334155] tabular-nums">
                            {inr(product.price)}
                          </span>
                          {product.mrp && (
                            <span className="text-[10.5px] text-[#94A3B8] line-through tabular-nums">
                              {inr(product.mrp)}
                            </span>
                          )}
                        </div>
                        {discount > 0 && (
                          <div className="text-[10px] font-bold text-emerald-600">
                            {discount}% off
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10.5px] font-bold transition-colors ${
                          qty > 0
                            ? "border-[#16A34A]/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-[#DC2626] bg-[#FF6F00] text-white shadow-sm shadow-orange-500/20 hover:bg-[#E65100]"
                        }`}
                      >
                        {qty > 0 ? (
                          <>
                            <Check className="h-3 w-3" />
                            In cart · {qty}
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          )}

          {/* Cart */}
          <aside className="self-start rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs xl:sticky xl:top-2">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#334155]">
                <ShoppingCart className="h-4 w-4 text-[#FF6F00]" />
                Your cart
              </h2>
              <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-bold text-[#C2410C] tabular-nums">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            </div>

            {cartLines.length === 0 ? (
              <div className="px-2 py-8 text-center">
                <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-[#CBD5E1]" />
                <p className="text-xs font-semibold text-[#334155]">
                  Your cart is empty
                </p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-[#94A3B8]">
                  Add creator merch, downloads or a course to support the people
                  behind the videos.
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-[280px] overflow-y-auto saffron-scrollbar">
                  {cartLines.map(({ product, qty }) => (
                    <div
                      key={product.id}
                      className="flex gap-2.5 border-b border-[#F1F5F9] py-3 last:border-0"
                    >
                      <ContentImage
                        src={product.image}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-[#E2E8F0]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[10.5px] font-semibold leading-snug text-[#334155]">
                          {product.name}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-full border border-[#E2E8F0]">
                            <button
                              onClick={() => decrement(product.id)}
                              aria-label={`Decrease quantity of ${product.name}`}
                              className="flex h-5 w-5 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-[10.5px] font-bold tabular-nums text-[#334155]">
                              {qty}
                            </span>
                            <button
                              onClick={() => increment(product.id)}
                              aria-label={`Increase quantity of ${product.name}`}
                              className="flex h-5 w-5 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-[11px] font-bold tabular-nums text-[#334155]">
                            {inr(product.price * qty)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLine(product.id)}
                        aria-label={`Remove ${product.name}`}
                        title="Remove"
                        className="self-start rounded-full p-0.5 text-[#94A3B8] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 border-t border-[#F1F5F9] pt-3 text-[11px]">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>Subtotal</span>
                    <span className="font-semibold tabular-nums text-[#334155]">
                      {inr(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>Delivery and taxes</span>
                    <span className="font-semibold text-[#334155]">Calculated at checkout</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-1.5 text-xs">
                    <span className="font-bold text-[#334155]">Items total</span>
                    <span className="font-black tabular-nums text-[#334155]">
                      {inr(total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting || cartLines.length === 0}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF6F00] px-3 py-2 text-[11.5px] font-bold text-white shadow-sm shadow-orange-500/25 transition-colors hover:bg-[#E65100] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing order..." : "Checkout"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <p className="mt-2 flex items-center justify-center gap-1 text-[9.5px] text-[#94A3B8]">
                  <CreditCard className="h-3 w-3" />
                  UPI · Cards · Net banking
                </p>
              </>
            )}

            <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[10px] leading-relaxed text-[#64748B]">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
              Buyer protection on every order. Digital items are delivered
              instantly to your account.
            </div>
          </aside>
        </div>
      ) : (
        /* Orders */
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Orders placed
              </div>
              <div className="mt-1 text-xl font-black text-[#334155] tabular-nums">
                {orders.length}
              </div>
              <div className="text-[10px] font-semibold text-[#64748B]">
                Lifetime with Opencontent
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                On the way
              </div>
              <div className="mt-1 text-xl font-black text-[#2563EB] tabular-nums">
                {ordersInTransit}
              </div>
              <div className="text-[10px] font-semibold text-[#64748B]">
                Shipped or processing
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Total spent
              </div>
              <div className="mt-1 text-xl font-black text-[#16A34A] tabular-nums">
                {inr(totalSpent)}
              </div>
              <div className="text-[10px] font-semibold text-[#64748B]">
                Creators paid directly
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center shadow-xs">
              <Package className="mx-auto mb-3 h-10 w-10 text-[#CBD5E1]" />
              <h3 className="text-sm font-bold text-[#334155]">No orders placed yet</h3>
              <p className="mt-1 text-xs text-[#64748B] max-w-sm mx-auto">
                Your purchases and digital course enrolments will appear here with instant receipt verification.
              </p>
            </div>
          ) : (
            orders.map((order) => {
            const status = ORDER_STATUS[order.status];
            const itemCount = order.items.reduce(
              (sum, item) => sum + item.qty,
              0
            );
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-[#334155]">
                        <ReceiptText className="h-4 w-4 text-[#94A3B8]" />
                        {order.id}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9.5px] font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#64748B]">
                      Placed {order.date} · {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black tabular-nums text-[#334155]">
                      {inr(order.total)}
                    </div>
                    <button
                      onClick={() =>
                        onToast(`Invoice for order ${order.id} would download here.`)
                      }
                      className="text-[10.5px] font-bold text-[#FF6F00] hover:underline"
                    >
                      View invoice
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.name}`}
                      className="flex items-center gap-2 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-1.5 pr-2.5"
                    >
                      <ContentImage
                        src={item.image ?? ""}
                        alt=""
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-[#E2E8F0]"
                      />
                      <div className="min-w-0">
                        <p className="max-w-[190px] truncate text-[10.5px] font-semibold text-[#334155]">
                          {item.name}
                        </p>
                        <p className="text-[9.5px] text-[#94A3B8]">
                          Qty {item.qty}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9] pt-3">
                  <p className="flex items-center gap-1 text-[10.5px] text-[#64748B]">
                    <Truck className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {order.status === "delivered"
                      ? "Delivered to your saved address"
                      : order.status === "shipped"
                      ? "Out for delivery · arrives in 2–3 days"
                      : "Packing at the creator's studio"}
                  </p>
                  <button
                    onClick={() =>
                      onToast(
                        "Support is available from the Policies → Public Complaints section."
                      )
                    }
                    className="text-[10.5px] font-semibold text-[#64748B] hover:text-[#FF6F00]"
                  >
                    Need help with this order?
                  </button>
                </div>
              </div>
            );
          }))}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-4">
            <div>
              <h3 className="text-xs font-bold text-[#334155]">
                Looking for something you bought before?
              </h3>
              <p className="mt-0.5 text-[10.5px] text-[#64748B]">
                Digital downloads stay in your account forever — re-download any
                time.
              </p>
            </div>
            <button
              onClick={() => onTabChange("store")}
              className="inline-flex items-center gap-1 rounded-full border border-[#FF6F00]/30 bg-[#FFF7ED] px-3 py-1.5 text-[11px] font-bold text-[#C2410C] transition-colors hover:border-[#FF6F00]/60 hover:bg-[#FFEDD5]"
            >
              Browse the store
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

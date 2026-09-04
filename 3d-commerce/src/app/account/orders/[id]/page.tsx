"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  subtotalMinor: number;
  shippingMinor: number;
  taxMinor: number;
  discountMinor: number;
  currency: string;
  createdAt: string;
  items: Array<{ id: string; productId: string; productName: string; quantity: number; unitPriceMinor: number; totalPriceMinor: number }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  shipment: {
    status: string;
    carrier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
}

async function getOrder(id: string) {
  const token = window.localStorage.getItem("access_token");
  if (!token) throw new Error("Authentication is required");
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to load order");
  return body as Order;
}

function money(currency: string, minor: number) {
  return `${currency} ${(minor / 100).toLocaleString("en-IN")}`;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrder(params.id)
      .then(setOrder)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unable to load order";
        setError(message);
        if (message.toLowerCase().includes("authentication")) {
          router.push(`/login?next=${encodeURIComponent(`/account/orders/${params.id}`)}`);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return <main className="min-h-screen bg-background px-4 py-10 text-foreground">Loading order…</main>;
  if (!order) return <main className="min-h-screen bg-background px-4 py-10 text-foreground">{error ?? "Order not found"}</main>;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/account/orders" className="text-xs text-muted hover:text-foreground">← Back to orders</Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary">Order</p>
            <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em]">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-muted">Placed {new Date(order.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <span className="rounded-full border border-white/[0.08] px-4 py-2 text-xs capitalize text-muted">{order.status.replaceAll("_", " ").toLowerCase()}</span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Items</p>
            <div className="mt-5 divide-y divide-white/[0.06]">
              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 py-4">
                  <div>
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="mt-1 text-xs text-muted">Qty {item.quantity} · {money(order.currency, item.unitPriceMinor)} each</p>
                  </div>
                  <span className="text-sm font-medium">{money(order.currency, item.totalPriceMinor)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-5 text-sm">
              <div className="flex justify-between gap-4"><span className="text-muted">Subtotal</span><span>{money(order.currency, order.subtotalMinor)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted">Shipping</span><span>{money(order.currency, order.shippingMinor)}</span></div>
              {order.discountMinor > 0 && <div className="flex justify-between gap-4"><span className="text-muted">Discount</span><span>-{money(order.currency, order.discountMinor)}</span></div>}
              {order.taxMinor > 0 && <div className="flex justify-between gap-4"><span className="text-muted">Tax</span><span>{money(order.currency, order.taxMinor)}</span></div>}
              <div className="flex justify-between gap-4 pt-2 text-base font-semibold"><span>Total</span><span>{money(order.currency, order.totalMinor)}</span></div>
            </div>
          </section>

          <div className="space-y-6">
            {order.shippingAddress && (
              <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Delivery</p>
                <p className="mt-3 text-sm font-medium">{order.shippingAddress.fullName}</p>
                <p className="mt-1 text-xs text-muted">{order.shippingAddress.phone}</p>
                <p className="mt-4 text-sm leading-6 text-muted">
                  {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              </section>
            )}

            {order.shipment && (
              <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Shipment</p>
                <p className="mt-2 text-sm capitalize">{order.shipment.status.replaceAll("_", " ").toLowerCase()}</p>
                {order.shipment.carrier && <p className="mt-2 text-xs text-muted">Carrier: {order.shipment.carrier}</p>}
                {order.shipment.trackingNumber && <p className="mt-1 text-xs text-muted">Tracking: {order.shipment.trackingNumber}</p>}
                {order.shipment.trackingUrl && <a href={order.shipment.trackingUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full border border-white/[0.08] px-4 py-2 text-xs hover:border-primary/40">Track shipment</a>}
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

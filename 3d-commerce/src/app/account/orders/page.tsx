"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: string;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number; unitPriceMinor: number }>;
}

async function getOrders() {
  const token = window.localStorage.getItem("access_token");
  if (!token) throw new Error("Authentication is required");
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to load orders");
  return body as Order[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary">Account</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em]">Your orders</h1>
        <p className="mt-2 text-sm text-muted">Track every physical product you've ordered from us.</p>

        {error && <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          {loading ? (
            <div className="px-5 py-10 text-sm text-muted">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted">You have not placed an order yet.</div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {orders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="block px-5 py-5 transition-colors hover:bg-white/[0.03] sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-muted">{new Date(order.createdAt).toLocaleDateString("en-IN")} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-xs capitalize text-muted">{order.status.replaceAll("_", " ").toLowerCase()}</span>
                      <span className="text-sm font-semibold">{order.currency} {(order.totalMinor / 100).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="text-xs text-muted">{item.productName} × {item.quantity}</div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

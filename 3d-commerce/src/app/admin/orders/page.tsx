"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconRefresh, IconSearch } from "@tabler/icons-react";
import {
  getAdminOrders,
  type AdminOrder,
  updateAdminOrderStatus,
} from "@/lib/admin-api";

const STATUSES = ["ALL", "PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminAccessToken");
}

function formatMoney(minor: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    const token = getToken();
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }
    setLoading(true);
    try {
      setOrders(await getAdminOrders(token, status === "ALL" ? undefined : status));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [status]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) =>
      [
        order.orderNumber,
        order.user?.email,
        order.user?.name,
        order.shippingAddress?.fullName,
        ...order.items.map((item) => item.productName),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [orders, search]);

  async function transition(order: AdminOrder, next: string) {
    const token = getToken();
    if (!token) return;
    try {
      await updateAdminOrderStatus(token, order.id, next);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update order");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin" className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground">
              Admin
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Orders</h1>
            <p className="mt-2 text-sm text-muted">Manage physical orders, payment state, fulfillment, and delivery.</p>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted/10">
            <IconRefresh size={16} /> Refresh
          </button>
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <IconSearch size={17} className="text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, product..." className="w-full bg-transparent text-sm outline-none" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none">
            {STATUSES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
          </select>
        </div>

        {message && <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{message}</div>}

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.1fr_1.2fr_.9fr_.9fr_1fr_40px] gap-4 border-b border-border px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted lg:grid">
            <span>Order</span><span>Customer</span><span>Amount</span><span>Status</span><span>Created</span><span />
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-muted">Loading orders…</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted">No orders found.</div>
          ) : (
            filtered.map((order) => (
              <div key={order.id} className="grid gap-3 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-[1.1fr_1.2fr_.9fr_.9fr_1fr_40px] lg:items-center">
                <div>
                  <div className="font-medium">{order.orderNumber}</div>
                  <div className="mt-1 text-xs text-muted">{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</div>
                </div>
                <div>
                  <div className="text-sm">{order.user?.name ?? "Customer"}</div>
                  <div className="text-xs text-muted">{order.user?.email ?? "—"}</div>
                </div>
                <div className="font-medium">{formatMoney(order.totalMinor, order.currency)}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-wide">{order.status.replaceAll("_", " ")}</span>
                  {order.status === "CONFIRMED" && (
                    <button type="button" onClick={() => void transition(order, "PROCESSING")} className="text-xs text-primary hover:underline">Process</button>
                  )}
                  {order.status === "PROCESSING" && (
                    <button type="button" onClick={() => void transition(order, "READY_TO_SHIP")} className="text-xs text-primary hover:underline">Ready</button>
                  )}
                  {order.status === "READY_TO_SHIP" && (
                    <button type="button" onClick={() => void transition(order, "SHIPPED")} className="text-xs text-primary hover:underline">Ship</button>
                  )}
                  {order.status === "SHIPPED" && (
                    <button type="button" onClick={() => void transition(order, "DELIVERED")} className="text-xs text-primary hover:underline">Deliver</button>
                  )}
                </div>
                <div className="text-xs text-muted">{formatDate(order.createdAt)}</div>
                <Link href={`/admin/orders/${order.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted/10">
                  <IconArrowRight size={15} />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

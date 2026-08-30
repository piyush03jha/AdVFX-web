"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const token = window.localStorage.getItem("access_token");
    if (!token) {
      router.push(`/login?next=${encodeURIComponent("/account/notifications")}`);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to load notifications");
    setItems(body);
  }

  useEffect(() => {
    load()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    const token = window.localStorage.getItem("access_token");
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
  }

  async function markAllRead() {
    const token = window.localStorage.getItem("access_token");
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Account</p>
            <h1 className="mt-2 font-serif text-4xl">Notifications</h1>
            <p className="mt-2 text-sm text-muted">Order and custom-build updates from the team.</p>
          </div>
          <button type="button" onClick={markAllRead} className="rounded-full border border-white/[0.08] px-4 py-2 text-xs text-muted hover:text-foreground">Mark all read</button>
        </div>

        {error && <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          {loading ? (
            <div className="px-5 py-10 text-sm text-muted">Loading notifications…</div>
          ) : items.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted">You're all caught up.</div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {items.map((item) => (
                <button key={item.id} type="button" onClick={() => markRead(item.id)} className={`block w-full px-5 py-5 text-left transition-colors hover:bg-white/[0.03] ${item.readAt ? "opacity-65" : "bg-white/[0.025]"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{item.message}</p>
                    </div>
                    <time className="shrink-0 text-[11px] text-muted" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("en-IN")}</time>
                  </div>
                  {!item.readAt && <span className="mt-3 inline-block rounded-full bg-primary/15 px-2.5 py-1 text-[10px] text-primary">Unread</span>}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

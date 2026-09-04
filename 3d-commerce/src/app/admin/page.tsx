"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getDashboard, getAdminOrders, type AdminDashboard, type AdminOrder } from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("admin_access_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    Promise.all([getDashboard(token), getAdminOrders(token)])
      .then(([dashboard, recentOrders]) => {
        setData(dashboard);
        setOrders(recentOrders.slice(0, 6));
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unable to load dashboard";
        setError(message);
      });
  }, [router]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [orders],
  );

  if (error) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
          <p className="text-sm text-red-300">{error}</p>
          <Link href="/admin/login" className="mt-4 inline-block text-sm text-primary">
            Return to admin login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Administration</p>
            <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">Store dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              One place to monitor orders, inventory, custom builds, and catalog health.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <QuickLink href="/admin/products" label="Products" />
            <QuickLink href="/admin/orders" label="Orders" />
            <QuickLink href="/admin/inventory" label="Inventory" />
            <QuickLink href="/admin/custom-requests" label="Custom builds" />
          </div>
        </div>

        {!data ? (
          <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-sm text-muted">
            Loading dashboard…
          </div>
        ) : (
          <>
            <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Total products" value={data.products.total} hint={`${data.products.active} active`} />
              <Metric label="Orders" value={data.orders.total} hint={`${data.orders.pendingPayment} awaiting payment`} />
              <Metric label="Available units" value={data.inventory.availableUnits} hint={`${data.inventory.reservedUnits} reserved`} />
              <Metric label="Custom builds" value={data.customBuilds.total} hint={`${data.customBuilds.needsAttention} need attention`} />
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <Panel title="Orders needing attention" actionHref="/admin/orders" actionLabel="View all">
                {recentOrders.length === 0 ? (
                  <EmptyState text="No orders have been created yet." />
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders?order=${encodeURIComponent(order.id)}`}
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                          <p className="mt-1 truncate text-xs text-muted">
                            {order.user?.name ?? order.user?.email ?? "Guest customer"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-medium">{formatMoney(order.totalMinor, order.currency)}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">{formatStatus(order.status)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title="Store health">
                <div className="space-y-4">
                  <HealthRow label="Low stock products" value={data.lowStockProducts} href="/admin/inventory" />
                  <HealthRow label="Ready to ship" value={data.orders.readyToShip} href="/admin/orders" />
                  <HealthRow label="Orders processing" value={data.orders.processing} href="/admin/orders" />
                  <HealthRow label="Active categories" value={data.categories} href="/admin/categories" />
                </div>
              </Panel>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <ShortcutCard href="/admin/inventory" title="Inventory" description="Review stock, reservations, and low-stock products." />
              <ShortcutCard href="/admin/custom-requests" title="Custom builds" description="Review customer requests and 3D model progress." />
              <ShortcutCard href="/admin/shipping" title="Shipping rules" description="Manage delivery pricing and estimated delivery windows." />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-full border border-white/[0.08] px-4 py-2 transition-colors hover:border-primary/40 hover:bg-white/[0.03]">
      {label}
    </Link>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{value.toLocaleString("en-IN")}</p>
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </div>
  );
}

function Panel({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium">{title}</h2>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="text-xs text-primary hover:text-primary-hover">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function HealthRow({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-2xl border border-white/[0.06] px-4 py-3 transition-colors hover:border-primary/30 hover:bg-white/[0.02]">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold">{value.toLocaleString("en-IN")}</span>
    </Link>
  );
}

function ShortcutCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-primary/30 hover:bg-white/[0.03]">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted">{description}</p>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-white/[0.08] p-6 text-sm text-muted">{text}</p>;
}

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

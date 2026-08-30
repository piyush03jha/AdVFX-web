"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getDashboard, type AdminDashboard } from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("admin_access_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    getDashboard(token)
      .then(setData)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unable to load dashboard";
        setError(message);
      });
  }, [router]);

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Administration</p>
            <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">Store dashboard</h1>
            <p className="mt-2 text-sm text-muted">Manage the physical product catalog and storefront.</p>
          </div>

          <div className="flex gap-2 text-sm">
            <Link href="/admin/products" className="rounded-full border border-white/[0.08] px-4 py-2 hover:border-primary/40">Products</Link>
            <Link href="/admin/categories" className="rounded-full border border-white/[0.08] px-4 py-2 hover:border-primary/40">Categories</Link>
          </div>
        </div>

        {!data ? (
          <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-sm text-muted">Loading dashboard…</div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Total products" value={data.products.total} />
            <Metric label="Active products" value={data.products.active} />
            <Metric label="Categories" value={data.categories} />
            <Metric label="Low stock" value={data.lowStockProducts} />
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  );
}

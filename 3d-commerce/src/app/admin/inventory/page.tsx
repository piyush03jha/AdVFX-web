"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconRefresh, IconSearch, IconPackage } from "@tabler/icons-react";
import {
  getAdminInventory,
  type AdminInventoryProduct,
  updateProductInventory,
} from "@/lib/admin-api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminAccessToken");
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<AdminInventoryProduct[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftStock, setDraftStock] = useState("");
  const [draftLowStockAt, setDraftLowStockAt] = useState("");

  async function load() {
    const token = getToken();
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }
    setLoading(true);
    try {
      setProducts(await getAdminInventory(token));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [product.name, product.slug, product.category?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [products, query]);

  function beginEdit(product: AdminInventoryProduct) {
    setEditingId(product.id);
    setDraftStock(String(product.inventory.stock));
    setDraftLowStockAt(String(product.inventory.lowStockAt));
  }

  async function save(product: AdminInventoryProduct) {
    const token = getToken();
    if (!token) return;
    const stock = Number(draftStock);
    const lowStockAt = Number(draftLowStockAt);
    if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(lowStockAt) || lowStockAt < 0) {
      setError("Stock and low-stock threshold must be non-negative integers.");
      return;
    }

    try {
      await updateProductInventory(token, product.id, {
        stock,
        lowStockAt,
      });
      setEditingId(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update inventory");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin" className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground">Admin</Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Inventory</h1>
            <p className="mt-2 text-sm text-muted">Monitor stock, reservations, and low-stock thresholds for physical products.</p>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted/10">
            <IconRefresh size={16} /> Refresh
          </button>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <IconSearch size={17} className="text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." className="w-full bg-transparent text-sm outline-none" />
        </div>

        {error && <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-muted">Loading inventory…</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted">No inventory records found.</div>
          ) : (
            filtered.map((product) => {
              const available = Math.max(0, product.inventory.stock - product.inventory.reserved);
              const low = product.inventory.trackStock && !product.inventory.allowBackorder && available <= product.inventory.lowStockAt;
              const editing = editingId === product.id;

              return (
                <div key={product.id} className="grid gap-4 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-[1.5fr_.7fr_.7fr_.7fr_1fr] lg:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/10">
                      <IconPackage size={18} className="text-muted" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{product.name}</div>
                      <div className="mt-1 text-xs text-muted">{product.category?.name ?? "Uncategorized"}</div>
                    </div>
                  </div>

                  {editing ? (
                    <input value={draftStock} onChange={(event) => setDraftStock(event.target.value)} inputMode="numeric" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none" aria-label="Stock" />
                  ) : (
                    <div><div className="text-[11px] uppercase tracking-wide text-muted">Stock</div><div className="mt-1 font-medium">{product.inventory.stock}</div></div>
                  )}

                  <div><div className="text-[11px] uppercase tracking-wide text-muted">Reserved</div><div className="mt-1 font-medium">{product.inventory.reserved}</div></div>
                  <div><div className="text-[11px] uppercase tracking-wide text-muted">Available</div><div className={`mt-1 font-medium ${low ? "text-destructive" : ""}`}>{available}</div></div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {editing ? (
                      <>
                        <input value={draftLowStockAt} onChange={(event) => setDraftLowStockAt(event.target.value)} inputMode="numeric" className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none" aria-label="Low stock threshold" />
                        <button type="button" onClick={() => void save(product)} className="rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-muted/10">Save</button>
                        <button type="button" onClick={() => setEditingId(null)} className="rounded-full px-3 py-2 text-xs text-muted hover:text-foreground">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide ${low ? "border-destructive/30 text-destructive" : "border-border text-muted"}`}>
                          {low ? "Low stock" : "Healthy"}
                        </span>
                        <button type="button" onClick={() => beginEdit(product)} className="rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-muted/10">Adjust</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

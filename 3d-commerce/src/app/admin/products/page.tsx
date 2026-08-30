"use client";

import { useEffect, useMemo, useState } from "react";

import {
  archiveProduct,
  getProducts,
  type AdminProduct,
} from "@/lib/admin-api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) return;

    getProducts(token)
      .then(setProducts)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load products");
      });
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.slug.toLowerCase().includes(normalized),
    );
  }, [products, query]);

  const handleArchive = async (product: AdminProduct) => {
    const token = window.localStorage.getItem("admin_access_token");
    if (!token || product.status === "ARCHIVED") return;
    if (!window.confirm(`Archive ${product.name}?`)) return;

    await archiveProduct(token, product.id);
    setProducts((items) =>
      items.map((item) =>
        item.id === product.id ? { ...item, status: "ARCHIVED" } : item,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Catalog</p>
          <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em]">Products</h1>
          <p className="mt-2 text-sm text-muted">Manage physical products, pricing, availability and 3D previews.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products…"
            className="min-h-11 flex-1 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 text-sm outline-none focus:border-primary/50"
          />
          <button className="min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover">
            Add product
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/[0.08] px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-muted sm:grid">
            <span>Product</span>
            <span>Status</span>
            <span>Stock</span>
            <span>Price</span>
            <span />
          </div>

          <div className="divide-y divide-white/[0.06]">
            {filtered.map((product) => {
              const currentPrice = product.prices.find((price) => price.isActive);
              return (
                <div key={product.id} className="grid gap-3 px-5 py-5 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="mt-1 truncate text-xs text-muted">{product.slug}</p>
                  </div>
                  <Status value={product.status} />
                  <span className="text-sm">{product.inventory?.stock ?? 0}</span>
                  <span className="text-sm">{currentPrice ? `${currentPrice.currency} ${(currentPrice.amountMinor / 100).toLocaleString("en-IN")}` : "—"}</span>
                  <button
                    type="button"
                    onClick={() => handleArchive(product)}
                    disabled={product.status === "ARCHIVED"}
                    className="justify-self-start rounded-full border border-white/[0.08] px-3 py-2 text-xs hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                  >
                    Archive
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function Status({ value }: { value: AdminProduct["status"] }) {
  return <span className="text-xs text-muted">{value.toLowerCase()}</span>;
}

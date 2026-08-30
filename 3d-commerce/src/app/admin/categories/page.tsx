"use client";

import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  getCategories,
  type AdminCategory,
} from "@/lib/admin-api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) return;
    try {
      setCategories(await getCategories(token));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load categories");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const token = window.localStorage.getItem("admin_access_token");
    if (!token || !name.trim() || !slug.trim()) return;
    try {
      const category = await createCategory(token, {
        name: name.trim(),
        slug: slug.trim(),
      });
      setCategories((items) => [...items, category]);
      setName("");
      setSlug("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create category");
    }
  };

  const remove = async (category: AdminCategory) => {
    const token = window.localStorage.getItem("admin_access_token");
    if (!token || !window.confirm(`Remove ${category.name}?`)) return;
    try {
      await deleteCategory(token, category.id);
      setCategories((items) =>
        items.filter((item) => item.id !== category.id),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to remove category");
    }
  };

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Catalog</p>
        <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em]">Categories</h1>
        <p className="mt-2 text-sm text-muted">Control the categories shown throughout the storefront.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" className="min-h-11 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 text-sm outline-none focus:border-primary/50" />
          <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="category-slug" className="min-h-11 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 text-sm outline-none focus:border-primary/50" />
          <button type="button" onClick={add} className="min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover">Add</button>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 divide-y divide-white/[0.06] overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-4 px-5 py-5">
              <div>
                <p className="text-sm font-medium">{category.name}</p>
                <p className="mt-1 text-xs text-muted">{category.slug} · {category._count?.products ?? 0} products</p>
              </div>
              <button type="button" onClick={() => remove(category)} className="rounded-full border border-white/[0.08] px-3 py-2 text-xs hover:border-red-400/40 hover:text-red-300">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

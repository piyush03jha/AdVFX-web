"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  addProductMedia,
  archiveProduct,
  createProduct,
  deleteProductFile,
  getCategories,
  getProductFiles,
  getProducts,
  removeProductMedia,
  setProductPrice,
  updateProduct,
  updateProductInventory,
  uploadProductFile,
  type AdminCategory,
  type AdminProduct,
  type AdminProductFile,
} from "@/lib/admin-api";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  status: "DRAFT" as AdminProduct["status"],
  isFeatured: false,
  isTrending: false,
  isBestseller: false,
  badge: "",
  material: "",
  scale: "",
  dimensions: "",
  height: "",
  base: "",
  packaging: "",
  weight: "",
  stock: "0",
  lowStockAt: "5",
  price: "",
  compareAt: "",
  imageUrl: "",
  modelPreviewUrl: "",
};

type ProductForm = typeof emptyForm;

const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";
const MODEL_ACCEPT = ".glb,.gltf,.fbx,.obj,.ply,.stl,.usd,.usda,.usdz,.abc,.bvh";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [files, setFiles] = useState<AdminProductFile[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"image" | "model" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const token = typeof window !== "undefined"
    ? window.localStorage.getItem("admin_access_token")
    : null;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Admin session not found. Please sign in again.");
      return;
    }

    Promise.all([getProducts(token), getCategories(token)])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load catalog");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.slug, product.category?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [products, query]);

  const openCreate = () => {
    setSelected(null);
    setFiles([]);
    setForm(emptyForm);
    setError(null);
    setNotice(null);
  };

  const openEdit = async (product: AdminProduct) => {
    const currentPrice = product.prices.find((price) => price.isActive);
    const primaryImage = product.media.find(
      (media) => media.type === "IMAGE" && media.isPrimary,
    ) ?? product.media.find((media) => media.type === "IMAGE");
    const modelPreview = product.media.find(
      (media) => media.type === "MODEL_PREVIEW",
    );

    setSelected(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      categoryId: product.category?.id ?? "",
      status: product.status,
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
      isBestseller: product.isBestseller,
      badge: product.badge ?? "",
      material: product.material ?? "",
      scale: product.scale ?? "",
      dimensions: product.dimensions ?? "",
      height: product.height ?? "",
      base: product.base ?? "",
      packaging: product.packaging ?? "",
      weight: product.weight ?? "",
      stock: String(product.inventory?.stock ?? 0),
      lowStockAt: String(product.inventory?.lowStockAt ?? 5),
      price: currentPrice ? String(currentPrice.amountMinor / 100) : "",
      compareAt: currentPrice?.compareAtMinor
        ? String(currentPrice.compareAtMinor / 100)
        : "",
      imageUrl: primaryImage?.url ?? "",
      modelPreviewUrl: modelPreview?.url ?? "",
    });
    setError(null);
    setNotice(null);

    if (token) {
      try {
        setFiles(await getProductFiles(token, product.id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load product assets");
      }
    }
  };

  const updateField = <K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const refreshProduct = (saved: AdminProduct) => {
    setProducts((current) => {
      const existing = current.some((item) => item.id === saved.id);
      return existing
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];
    });
    setSelected(saved);
  };

  const syncMedia = async (product: AdminProduct) => {
    if (!token) return product;

    const currentImage = product.media.find(
      (media) => media.type === "IMAGE" && media.isPrimary,
    ) ?? product.media.find((media) => media.type === "IMAGE");
    const currentModel = product.media.find(
      (media) => media.type === "MODEL_PREVIEW",
    );

    let latest = product;

    if (form.imageUrl.trim() && form.imageUrl.trim() !== currentImage?.url) {
      latest = await addProductMedia(token, product.id, {
        type: "IMAGE",
        url: form.imageUrl.trim(),
        isPrimary: true,
        sortOrder: 0,
      });
    } else if (!form.imageUrl.trim() && currentImage) {
      latest = await removeProductMedia(token, latest.id, currentImage.id);
    }

    const refreshedModel = latest.media.find(
      (media) => media.type === "MODEL_PREVIEW",
    ) ?? currentModel;

    if (
      form.modelPreviewUrl.trim() &&
      form.modelPreviewUrl.trim() !== refreshedModel?.url
    ) {
      latest = await addProductMedia(token, product.id, {
        type: "MODEL_PREVIEW",
        url: form.modelPreviewUrl.trim(),
        isPrimary: true,
        sortOrder: 0,
      });
    } else if (!form.modelPreviewUrl.trim() && refreshedModel) {
      latest = await removeProductMedia(token, latest.id, refreshedModel.id);
    }

    return latest;
  };

  const handleFileUpload = async (file: File, kind: "image" | "model") => {
    if (!token || !selected) {
      setError("Save the product first, then upload assets.");
      return;
    }

    setUploading(kind);
    setError(null);
    setNotice(null);

    try {
      const uploaded = await uploadProductFile(token, selected.id, file);
      const nextFiles = [uploaded, ...files.filter((item) => item.id !== uploaded.id)];
      setFiles(nextFiles);

      if (kind === "image") {
        const imageUrl = uploaded.storageUrl ?? `/products/${selected.id}/files/${uploaded.id}`;
        setForm((current) => ({ ...current, imageUrl }));
        const updated = await addProductMedia(token, selected.id, {
          type: "IMAGE",
          url: imageUrl,
          isPrimary: true,
          sortOrder: 0,
        });
        refreshProduct(updated);
      } else {
        setNotice("3D model uploaded. Processing has been queued.");
      }

      if (kind === "image") {
        setNotice("Product image uploaded.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const amountMinor = Math.round(Number(form.price) * 100);
      const compareAtMinor = form.compareAt
        ? Math.round(Number(form.compareAt) * 100)
        : null;

      if (!form.name.trim() || !form.slug.trim()) {
        throw new Error("Name and slug are required.");
      }
      if (!Number.isFinite(amountMinor) || amountMinor < 0) {
        throw new Error("Enter a valid product price.");
      }

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId || undefined,
        status: form.status,
        isFeatured: form.isFeatured,
        isTrending: form.isTrending,
        isBestseller: form.isBestseller,
        badge: form.badge.trim() || undefined,
        material: form.material.trim() || undefined,
        scale: form.scale.trim() || undefined,
        dimensions: form.dimensions.trim() || undefined,
        height: form.height.trim() || undefined,
        base: form.base.trim() || undefined,
        packaging: form.packaging.trim() || undefined,
        weight: form.weight.trim() || undefined,
      };

      let saved = selected
        ? await updateProduct(token, selected.id, payload)
        : await createProduct(token, {
            ...payload,
            stock: Math.max(0, Number(form.stock) || 0),
            lowStockAt: Math.max(0, Number(form.lowStockAt) || 0),
          });

      if (selected) {
        saved = await updateProductInventory(token, saved.id, {
          stock: Math.max(0, Number(form.stock) || 0),
          lowStockAt: Math.max(0, Number(form.lowStockAt) || 0),
        });
      }

      const currentPrice = saved.prices.find((price) => price.isActive);
      if (
        amountMinor !== (currentPrice?.amountMinor ?? null) ||
        compareAtMinor !== (currentPrice?.compareAtMinor ?? null)
      ) {
        saved = await setProductPrice(token, saved.id, {
          currency: "INR",
          amountMinor,
          compareAtMinor,
          isActive: true,
        });
      }

      saved = await syncMedia(saved);
      refreshProduct(saved);
      setNotice(selected ? "Product updated successfully." : "Product created successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (product: AdminProduct) => {
    if (!token || product.status === "ARCHIVED") return;
    if (!window.confirm(`Archive ${product.name}?`)) return;

    try {
      await archiveProduct(token, product.id);
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, status: "ARCHIVED" } : item,
        ),
      );
      if (selected?.id === product.id) {
        setSelected((current) =>
          current ? { ...current, status: "ARCHIVED" } : current,
        );
      }
      setNotice("Product archived.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to archive product");
    }
  };

  const handleDeleteFile = async (file: AdminProductFile) => {
    if (!token || !selected) return;
    if (!window.confirm(`Delete ${file.originalName}?`)) return;

    try {
      await deleteProductFile(token, selected.id, file.id);
      setFiles((current) => current.filter((item) => item.id !== file.id));
      setNotice("Asset deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to delete asset");
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Catalog</p>
            <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">Products</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Manage physical products, pricing, inventory, images and interactive 3D previews.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add product
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, slug or category…"
            className="min-h-11 flex-1 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 text-sm outline-none focus:border-primary/50"
          />
          <div className="rounded-full border border-white/[0.08] px-4 py-3 text-xs text-muted">
            {filtered.length} products
          </div>
        </div>

        {error && <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}
        {notice && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,540px)]">
          <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/[0.08] px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-muted sm:grid">
              <span>Product</span>
              <span>Status</span>
              <span>Stock</span>
              <span>Price</span>
              <span />
            </div>

            {loading ? (
              <div className="px-5 py-10 text-sm text-muted">Loading catalog…</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-10 text-sm text-muted">No products found.</div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filtered.map((product) => {
                  const currentPrice = product.prices.find((price) => price.isActive);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => void openEdit(product)}
                      className={`grid w-full gap-3 px-5 py-5 text-left transition-colors hover:bg-white/[0.03] sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-4 ${selected?.id === product.id ? "bg-white/[0.04]" : ""}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{product.name}</span>
                        <span className="mt-1 block truncate text-xs text-muted">
                          {product.category?.name ?? "Uncategorized"} · {product.slug}
                        </span>
                      </span>
                      <Status value={product.status} />
                      <span className="text-sm">
                        {product.inventory?.stock ?? 0}
                        {product.inventory && product.inventory.reserved > 0 ? ` (${product.inventory.reserved} reserved)` : ""}
                      </span>
                      <span className="text-sm">
                        {currentPrice
                          ? `${currentPrice.currency} ${(currentPrice.amountMinor / 100).toLocaleString("en-IN")}`
                          : "—"}
                      </span>
                      <span className="flex gap-2">
                        <span className="rounded-full border border-white/[0.08] px-3 py-2 text-xs">Edit</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary">
                  {selected ? "Edit product" : "New product"}
                </p>
                <h2 className="mt-1 font-serif text-2xl tracking-[-0.02em]">
                  {selected ? selected.name : "Create a product"}
                </h2>
              </div>
              {selected && (
                <button
                  type="button"
                  onClick={() => void handleArchive(selected)}
                  disabled={selected.status === "ARCHIVED"}
                  className="rounded-full border border-white/[0.08] px-3 py-2 text-xs text-muted hover:border-red-400/30 hover:text-red-300 disabled:opacity-40"
                >
                  Archive
                </button>
              )}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-5">
              <Field label="Name">
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} required className={inputClass} placeholder="Cyberpunk Warrior" />
              </Field>

              <Field label="Slug">
                <input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} required className={inputClass} placeholder="cyberpunk-warrior" />
              </Field>

              <Field label="Description">
                <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} className={`${inputClass} min-h-28 rounded-2xl py-3`} placeholder="Describe the physical product…" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <select value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)} className={inputClass}>
                    <option value="">Uncategorized</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => updateField("status", e.target.value as ProductForm["status"])} className={inputClass}>
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (INR)">
                  <input value={form.price} onChange={(e) => updateField("price", e.target.value)} type="number" min="0" step="0.01" required className={inputClass} placeholder="1499" />
                </Field>
                <Field label="Compare-at price (INR)">
                  <input value={form.compareAt} onChange={(e) => updateField("compareAt", e.target.value)} type="number" min="0" step="0.01" className={inputClass} placeholder="1999" />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Stock">
                  <input value={form.stock} onChange={(e) => updateField("stock", e.target.value)} type="number" min="0" step="1" className={inputClass} />
                </Field>
                <Field label="Low-stock alert at">
                  <input value={form.lowStockAt} onChange={(e) => updateField("lowStockAt", e.target.value)} type="number" min="0" step="1" className={inputClass} />
                </Field>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground">Physical specifications</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Material"><input value={form.material} onChange={(e) => updateField("material", e.target.value)} className={inputClass} placeholder="Premium Resin" /></Field>
                  <Field label="Scale"><input value={form.scale} onChange={(e) => updateField("scale", e.target.value)} className={inputClass} placeholder="1:6" /></Field>
                  <Field label="Dimensions"><input value={form.dimensions} onChange={(e) => updateField("dimensions", e.target.value)} className={inputClass} placeholder="30 × 18 × 12 cm" /></Field>
                  <Field label="Height"><input value={form.height} onChange={(e) => updateField("height", e.target.value)} className={inputClass} placeholder="30 cm" /></Field>
                  <Field label="Base"><input value={form.base} onChange={(e) => updateField("base", e.target.value)} className={inputClass} /></Field>
                  <Field label="Weight"><input value={form.weight} onChange={(e) => updateField("weight", e.target.value)} className={inputClass} placeholder="~0.8 kg" /></Field>
                  <Field label="Packaging"><input value={form.packaging} onChange={(e) => updateField("packaging", e.target.value)} className={`${inputClass} sm:col-span-2`} /></Field>
                </div>
              </div>

              <Field label="Badge">
                <input value={form.badge} onChange={(e) => updateField("badge", e.target.value)} className={inputClass} placeholder="Bestseller" />
              </Field>

              <div>
                <p className="text-xs font-medium text-foreground">Merchandising</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Toggle label="Featured" value={form.isFeatured} onChange={(value) => updateField("isFeatured", value)} />
                  <Toggle label="Trending" value={form.isTrending} onChange={(value) => updateField("isTrending", value)} />
                  <Toggle label="Bestseller" value={form.isBestseller} onChange={(value) => updateField("isBestseller", value)} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-foreground">Product assets</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">Upload the product image and the model used by the interactive viewer. Uploaded assets are not customer downloads.</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="cursor-pointer rounded-2xl border border-dashed border-white/[0.12] p-4 transition-colors hover:border-primary/40 hover:bg-white/[0.02]">
                    <span className="block text-xs font-medium">Upload product image</span>
                    <span className="mt-1 block text-[11px] text-muted">JPG, PNG, WEBP</span>
                    <input
                      type="file"
                      accept={IMAGE_ACCEPT}
                      className="sr-only"
                      disabled={!selected || uploading !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleFileUpload(file, "image");
                        event.currentTarget.value = "";
                      }}
                    />
                    <span className="mt-3 inline-flex rounded-full border border-white/[0.08] px-3 py-2 text-xs">
                      {uploading === "image" ? "Uploading…" : selected ? "Choose image" : "Create product first"}
                    </span>
                  </label>

                  <label className="cursor-pointer rounded-2xl border border-dashed border-white/[0.12] p-4 transition-colors hover:border-primary/40 hover:bg-white/[0.02]">
                    <span className="block text-xs font-medium">Upload 3D model</span>
                    <span className="mt-1 block text-[11px] text-muted">GLB, GLTF, FBX, OBJ, PLY, STL, USD, ABC, BVH</span>
                    <input
                      type="file"
                      accept={MODEL_ACCEPT}
                      className="sr-only"
                      disabled={!selected || uploading !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleFileUpload(file, "model");
                        event.currentTarget.value = "";
                      }}
                    />
                    <span className="mt-3 inline-flex rounded-full border border-white/[0.08] px-3 py-2 text-xs">
                      {uploading === "model" ? "Uploading…" : selected ? "Choose model" : "Create product first"}
                    </span>
                  </label>
                </div>

                {selected && files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] px-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{file.originalName}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-muted">{file.format} · {file.processingStatus.toLowerCase()}</p>
                        </div>
                        <button type="button" onClick={() => void handleDeleteFile(file)} className="rounded-full border border-white/[0.08] px-3 py-2 text-[11px] text-muted hover:border-red-400/30 hover:text-red-300">Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saving || uploading !== null}
                className="w-full min-h-12 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {saving ? "Saving…" : selected ? "Save changes" : "Create product"}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}

const inputClass = "min-h-11 w-full rounded-xl border border-white/[0.08] bg-black/10 px-3 text-sm outline-none transition-colors focus:border-primary/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] px-3 py-3">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function Status({ value }: { value: AdminProduct["status"] }) {
  return <span className="text-xs capitalize text-muted">{value.toLowerCase()}</span>;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/SiteNavbar";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid";
import { products } from "@/config/products";

const CATEGORY_MAP: Record<string, string> = {
  gaming: "Gaming",
  anime: "Anime",
  "mobile-tv": "Mobile / TV",
  mobiletv: "Mobile / TV",
  custom: "Custom",
  collectibles: "Collectibles",
  "desk-toys": "Desk Toys",
  "weapon-props": "Weapon Props",
  heroes: "Heroes",
  "custom-miniatures": "Custom Miniatures",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = CATEGORY_MAP[category.toLowerCase()];

  return {
    title: name ? `${name} | Forma` : "Shop | Forma",
    description: name
      ? `Explore Forma products in ${name}.`
      : "Explore premium physical 3D products at Forma.",
  };
}

export default async function CategoryShopPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const normalized = category.toLowerCase();
  const categoryName = CATEGORY_MAP[normalized];

  if (!categoryName) {
    notFound();
  }

  const categoryProducts = products.filter(
    (product) => product.category.toLowerCase() === categoryName.toLowerCase(),
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-8">
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-primary">
              Collection
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
              {categoryName}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {categoryProducts.length} products available
            </p>
          </div>

          <ShopProductGrid products={categoryProducts} columns={4} />
        </div>
      </main>
    </>
  );
}

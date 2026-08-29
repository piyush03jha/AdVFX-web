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

function slugifyCategory(category: string) {
  return category
    .toLowerCase()
    .replace(/\s*\/\s*/g, "-")
    .replace(/\s+/g, "-");
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((category) => ({
    category,
  }));
}

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
      ? `Explore Forma physical products in ${name}.`
      : "Explore premium physical 3D products at Forma.",
  };
}

export default async function CategoryShopPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryName = CATEGORY_MAP[category.toLowerCase()];

  if (!categoryName) notFound();

  const categoryProducts = products.filter(
    (product) =>
      product.category.toLowerCase() === categoryName.toLowerCase(),
  );

  return (
    <>
      <Navbar />
      <main
        id={`shop-category-${slugifyCategory(categoryName)}`}
        className="min-h-screen scroll-mt-24 bg-background"
      >
        <ShopProductGrid
          products={categoryProducts}
          columns={4}
          activeCategory={categoryName}
        />
      </main>
    </>
  );
}

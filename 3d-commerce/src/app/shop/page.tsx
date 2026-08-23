import type { Metadata } from "next";

import { ShopProductGrid } from "@/components/shop/ShopProductGrid";

export const metadata: Metadata = {
  title: "Shop 3D Models | Forma",
  description:
    "Explore premium 3D models, digital collectibles, gaming assets, characters and custom-ready models.",
};

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <ShopProductGrid />
    </main>
  );
}
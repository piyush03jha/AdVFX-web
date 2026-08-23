import { notFound } from "next/navigation";

import type { Metadata } from "next";

import {
  getProductById,
  getRelatedProducts,
  products,
} from "@/config/products";

import { ProductDetail } from "@/components/product/ProductDetail";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  const product =
    getProductById(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | 3D Models`,
    description:
      product.description,
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product =
    getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts =
    getRelatedProducts(product, 4);

  return (
    <ProductDetail
      product={product}
      relatedProducts={
        relatedProducts
      }
    />
  );
}
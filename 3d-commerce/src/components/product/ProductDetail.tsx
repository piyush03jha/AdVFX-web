"use client";

import { motion } from "motion/react";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

import type { Product } from "@/config/products";

import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductInfo } from "./ProductInfo";
import { ProductReviews } from "./ProductReviews";
import { ProductSpecs } from "./ProductSpecs";
import { ProductViewer } from "./ProductViewer";
import { RelatedProducts } from "./RelatedProducts";

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({
  product,
  relatedProducts,
}: ProductDetailProps) {
  return (
    <main>
      {/* =========================================
          PRODUCT HERO
      ========================================== */}

      <Section
        className="
          pt-6
          sm:pt-8
          lg:pt-10
        "
        glow
      >
        <Container>
          <ProductBreadcrumb
            category={product.category}
            productName={product.name}
          />

          <div
            className="
              mt-7
              grid
              gap-8
              lg:grid-cols-[1.15fr_0.85fr]
              lg:gap-12
              xl:gap-16
            "
          >
            {/* Viewer */}

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="
                min-w-0
                lg:sticky
                lg:top-24
                lg:self-start
              "
            >
              <ProductViewer
                model={product.model}
                name={product.name}
              />
            </motion.div>

            {/* Product information */}

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
                delay: 0.08,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="
                min-w-0
                lg:py-6
              "
            >
              <ProductInfo
                product={product}
              />
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* =========================================
          DETAILS
      ========================================== */}

      <Section>
        <Container>
          <ProductSpecs
            product={product}
          />

          <div className="mt-12">
            <ProductReviews
              product={product}
            />
          </div>

          <div className="mt-12">
            <RelatedProducts
              products={
                relatedProducts
              }
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
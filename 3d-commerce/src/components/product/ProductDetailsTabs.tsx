"use client";

import { useState } from "react";

import {
  IconCheck,
  IconChevronRight,
} from "@tabler/icons-react";

import type { Product } from "@/config/products";

import { ProductReviews } from "./ProductReviews";
import { ProductSpecs } from "./ProductSpecs";

interface ProductDetailsTabsProps {
  product: Product;
}

type Tab =
  | "description"
  | "specs"
  | "reviews";

const tabs: Array<{
  id: Tab;
  label: string;
}> = [
  {
    id: "description",
    label: "Description",
  },
  {
    id: "specs",
    label: "Specs",
  },
  {
    id: "reviews",
    label: "Reviews",
  },
];

export function ProductDetailsTabs({
  product,
}: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] =
    useState<Tab>("description");

  return (
    <section
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-white/[0.08]
        bg-white/[0.018]
      "
    >
      {/* ==================================================
          TAB HEADER
      ================================================== */}

      <div
        role="tablist"
        aria-label="Product information"
        className="
          flex
          overflow-x-auto
          border-b
          border-white/[0.07]
          px-4
          sm:px-6
        "
      >
        {tabs.map((tab) => {
          const active =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`
                relative
                shrink-0
                px-4
                py-5
                text-[10px]
                font-medium
                uppercase
                tracking-[0.17em]
                transition-colors
                sm:px-6
                ${
                  active
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }
              `}
            >
              {tab.label}

              {active && (
                <span
                  className="
                    absolute
                    inset-x-4
                    bottom-0
                    h-px
                    bg-primary
                    shadow-[0_0_12px_var(--glow-primary)]
                    sm:inset-x-6
                  "
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="p-5 sm:p-7 lg:p-9">
        {activeTab ===
          "description" && (
          <Description product={product} />
        )}

        {activeTab === "specs" && (
          <ProductSpecs product={product} />
        )}

        {activeTab ===
          "reviews" && (
          <ProductReviews product={product} />
        )}
      </div>
    </section>
  );
}

function Description({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="max-w-4xl">
      <div
        className="
          grid
          gap-8
          lg:grid-cols-[1fr_280px]
        "
      >
        <div>
          <p
            className="
              text-sm
              leading-7
              text-muted
              sm:text-[15px]
            "
          >
            {product.description}
          </p>

          <p
            className="
              mt-5
              text-sm
              leading-7
              text-muted
              sm:text-[15px]
            "
          >
            Built for modern real-time 3D
            workflows, this asset is designed
            to be easy to preview, download,
            and integrate into your projects.
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-white/[0.07]
            bg-black/15
            p-5
          "
        >
          <p
            className="
              text-[9px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-primary
            "
          >
            Included
          </p>

          <div className="mt-4 space-y-3">
            {[
              `${product.format} file`,
              `${product.textureResolution ?? "High-resolution"} textures`,
              `${product.polygonCount} polygons`,
              "Instant download",
            ].map((item) => (
              <div
                key={item}
                className="
                  flex
                  items-center
                  gap-2.5
                  text-xs
                  text-muted
                "
              >
                <IconCheck
                  size={14}
                  className="shrink-0 text-primary"
                />

                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {product.tags &&
        product.tags.length > 0 && (
          <div className="mt-7">
            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-primary
              "
            >
              Collections
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.02]
                    px-3
                    py-1.5
                    text-[10px]
                    text-muted
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
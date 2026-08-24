"use client";

import { useState } from "react";
import {
  IconBox,
  IconCheck,
  IconCube,
  IconFile3d,
  IconStar,
  IconTexture,
} from "@tabler/icons-react";

import type { Product } from "@/config/products";

interface ProductDetailsTabsProps {
  product: Product;
}

type Tab = "description" | "specs" | "reviews";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "description", label: "Description" },
  { id: "specs", label: "Specs" },
  { id: "reviews", label: "Reviews" },
];

const reviews = [
  {
    name: "Alex",
    rating: 5,
    text: "Excellent quality and very clean model.",
  },
  {
    name: "Jordan",
    rating: 5,
    text: "The model looks great in my scene.",
  },
  {
    name: "Sam",
    rating: 4,
    text: "Good detail and easy to work with.",
  },
];

export function ProductDetailsTabs({
  product,
}: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(
    "description",
  );

  return (
    <section className="border-t border-border">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-border scrollbar-none sm:gap-8">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 py-4 text-[10px] font-medium uppercase tracking-[0.16em] transition-colors sm:py-5 ${
                active
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}

              {active && (
                <span className="absolute inset-x-0 bottom-0 h-px bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <div className="py-7 sm:py-8">
        {activeTab === "description" && (
          <DescriptionContent product={product} />
        )}

        {activeTab === "specs" && (
          <SpecsContent product={product} />
        )}

        {activeTab === "reviews" && (
          <ReviewsContent product={product} />
        )}
      </div>
    </section>
  );
}

function DescriptionContent({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm leading-7 text-muted sm:text-[15px]">
        {product.description}
      </p>

      {product.tags && product.tags.length > 0 && (
        <div className="mt-6 space-y-3">
          {product.tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-2 text-sm text-muted"
            >
              <IconCheck
                size={14}
                stroke={1.7}
                className="shrink-0 text-primary"
              />
              <span>{tag} ready asset</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecsContent({
  product,
}: {
  product: Product;
}) {
  const specs = [
    {
      icon: <IconFile3d size={17} />,
      label: "Format",
      value: product.format,
    },
    {
      icon: <IconBox size={17} />,
      label: "File Size",
      value: product.fileSize,
    },
    {
      icon: <IconCube size={17} />,
      label: "Polygons",
      value: product.polygonCount,
    },
    {
      icon: <IconTexture size={17} />,
      label: "Textures",
      value: product.textureResolution ?? "Included",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
        >
          <div className="text-primary">{spec.icon}</div>

          <p className="mt-4 text-[9px] uppercase tracking-[0.16em] text-muted">
            {spec.label}
          </p>

          <p className="mt-1 text-sm font-medium text-foreground">
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ReviewsContent({
  product,
}: {
  product: Product;
}) {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            Customer feedback for this model.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <IconStar
              size={17}
              fill="currentColor"
              className="text-primary"
            />
            <span className="text-lg font-semibold text-foreground">
              {product.rating}
            </span>
          </div>

          <span className="text-xs text-muted">
            ({product.reviewCount})
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {reviews.map((review) => (
          <article
            key={review.name}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <IconStar
                  key={index}
                  size={12}
                  fill={
                    index < review.rating
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    index < review.rating
                      ? "text-primary"
                      : "text-muted/30"
                  }
                />
              ))}
            </div>

            <p className="mt-4 text-sm leading-6 text-muted">
              {review.text}
            </p>

            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground">
              {review.name}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

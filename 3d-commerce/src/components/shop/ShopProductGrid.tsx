"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { IconPackageOff } from "@tabler/icons-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

import {
  trendingProducts,
} from "@/config/trending-products";

import {
  MobileFilters,
} from "./MobileFilters";

import {
  ShopFilters,
  type ShopFilterState,
} from "./ShopFilters";

import {
  ShopProductCard,
} from "./ShopProductCard";

import {
  ShopSort,
  type ShopSortValue,
} from "./ShopSort";

import { ShopHeader } from "./ShopHeader";

const INITIAL_FILTERS: ShopFilterState = {
  categories: [],
  minPrice: 0,
  maxPrice: Infinity,
  minRating: 0,
};

export function ShopProductGrid() {
  const shouldReduceMotion =
    useReducedMotion();

  const [filters, setFilters] =
    useState<ShopFilterState>(
      INITIAL_FILTERS,
    );

  const [sort, setSort] =
    useState<ShopSortValue>(
      "featured",
    );

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        trendingProducts.map(
          (product) =>
            product.category,
        ),
      ),
    );
  }, []);

  const filteredProducts =
    useMemo(() => {
      const result =
        trendingProducts.filter(
          (product) => {
            const matchesCategory =
              filters.categories.length ===
                0 ||
              filters.categories.includes(
                product.category,
              );

            const matchesPrice =
              product.price >=
                filters.minPrice &&
              product.price <=
                filters.maxPrice;

            const matchesRating =
              product.rating >=
              filters.minRating;

            return (
              matchesCategory &&
              matchesPrice &&
              matchesRating
            );
          },
        );

      return result.sort(
        (a, b) => {
          switch (sort) {
            case "newest":
              return (
                trendingProducts.indexOf(
                  b,
                ) -
                trendingProducts.indexOf(
                  a,
                )
              );

            case "popular":
              return (
                b.reviewCount -
                a.reviewCount
              );

            case "rating":
              return (
                b.rating - a.rating
              );

            case "price-low":
              return (
                a.price - b.price
              );

            case "price-high":
              return (
                b.price - a.price
              );

            case "featured":
            default:
              return 0;
          }
        },
      );
    }, [filters, sort]);

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <>
      <ShopHeader
        productCount={
          filteredProducts.length
        }
        onOpenFilters={() =>
          setMobileFiltersOpen(true)
        }
      />

      <section
        className="
          relative
          pb-20
          sm:pb-24
          lg:pb-28
        "
      >
        <Container>
          <div
            className="
              grid
              gap-8
              lg:grid-cols-[230px_minmax(0,1fr)]
              lg:gap-10
          "
          >
            {/* Desktop filters */}

            <ShopFilters
              categories={categories}
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
            />

            {/* Products */}

            <div className="min-w-0">
              {/* Toolbar */}

              <div
                className="
                  mb-5
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      text-muted
                    "
                  >
                    Showing{" "}
                    <span className="text-foreground">
                      {
                        filteredProducts.length
                      }
                    </span>{" "}
                    models
                  </p>
                </div>

                <ShopSort
                  value={sort}
                  onChange={setSort}
                />
              </div>

              {/* Grid */}

              {filteredProducts.length >
              0 ? (
                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                    sm:grid-cols-2
                    sm:gap-4
                    md:grid-cols-3
                    xl:grid-cols-4
                  "
                >
                  {filteredProducts.map(
                    (
                      product,
                      index,
                    ) => (
                      <motion.div
                        key={product.id}
                        initial={
                          shouldReduceMotion
                            ? false
                            : {
                                opacity: 0,
                                y: 18,
                              }
                        }
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : {
                                opacity: 1,
                                y: 0,
                              }
                        }
                        transition={{
                          duration: 0.45,
                          delay: Math.min(
                            index *
                              0.035,
                            0.25,
                          ),
                          ease: [
                            0.22,
                            1,
                            0.36,
                            1,
                          ],
                        }}
                      >
                        <ShopProductCard
                          product={
                            product
                          }
                        />
                      </motion.div>
                    ),
                  )}
                </div>
              ) : (
                <EmptyProducts
                  onClear={
                    clearFilters
                  }
                />
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Mobile filter drawer */}

      <MobileFilters
        open={mobileFiltersOpen}
        onClose={() =>
          setMobileFiltersOpen(false)
        }
        categories={categories}
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
      />
    </>
  );
}

function EmptyProducts({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div
      className="
        flex
        min-h-[380px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-border
        bg-surface/40
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-surface-elevated
          text-muted
        "
      >
        <IconPackageOff
          size={20}
          stroke={1.5}
        />
      </div>

      <h3
        className="
          mt-5
          text-base
          font-medium
          text-foreground
        "
      >
        No models found
      </h3>

      <p
        className="
          mt-2
          max-w-sm
          text-xs
          leading-5
          text-muted
        "
      >
        Try changing your filters or
        exploring the complete
        collection.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClear}
        className="mt-5"
      >
        Clear Filters
      </Button>
    </div>
  );
}
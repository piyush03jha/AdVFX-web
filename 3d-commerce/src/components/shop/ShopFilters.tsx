"use client";

import {
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/Button";

export interface ShopFilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
}

interface ShopFiltersProps {
  categories: string[];
  filters: ShopFilterState;
  onChange: (
    filters: ShopFilterState,
  ) => void;
  onClear: () => void;
}

const PRICE_OPTIONS = [
  {
    label: "Under ₹2,000",
    min: 0,
    max: 2000,
  },
  {
    label: "₹2,000 – ₹4,000",
    min: 2000,
    max: 4000,
  },
  {
    label: "₹4,000 – ₹7,000",
    min: 4000,
    max: 7000,
  },
  {
    label: "₹7,000+",
    min: 7000,
    max: Infinity,
  },
];

const RATING_OPTIONS = [
  {
    label: "4.5+",
    value: 4.5,
  },
  {
    label: "4.0+",
    value: 4,
  },
  {
    label: "3.0+",
    value: 3,
  },
];

export function ShopFilters({
  categories,
  filters,
  onChange,
  onClear,
}: ShopFiltersProps) {
  const toggleCategory = (
    category: string,
  ) => {
    const exists =
      filters.categories.includes(category);

    onChange({
      ...filters,
      categories: exists
        ? filters.categories.filter(
            (item) => item !== category,
          )
        : [
            ...filters.categories,
            category,
          ],
    });
  };

  const setPrice = (
    min: number,
    max: number,
  ) => {
    onChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  return (
    <aside className="hidden lg:block">
      <div
        className="
          sticky
          top-28
          rounded-2xl
          border
          border-border/70
          bg-surface/60
          p-5
          backdrop-blur-xl
        "
      >
        {/* Header */}

        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-primary
              "
            >
              Refine
            </p>

            <h2
              className="
                mt-1
                text-sm
                font-medium
                text-foreground
              "
            >
              Filters
            </h2>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="
              text-[10px]
              text-muted
              transition-colors
              hover:text-primary-hover
            "
          >
            Clear all
          </button>
        </div>

        {/* Categories */}

        <FilterGroup title="Category">
          <div className="space-y-1">
            {categories.map(
              (category) => {
                const selected =
                  filters.categories.includes(
                    category,
                  );

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      toggleCategory(
                        category,
                      )
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      px-2
                      py-2
                      text-left
                      text-xs
                      text-muted
                      transition-all
                      hover:bg-surface-elevated
                      hover:text-foreground
                    "
                  >
                    <span>
                      {category}
                    </span>

                    <span
                      className={`
                        flex
                        h-4
                        w-4
                        items-center
                        justify-center
                        rounded
                        border
                        transition-all
                        ${
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-border"
                        }
                      `}
                    >
                      {selected && (
                        <IconCheck
                          size={11}
                          stroke={2}
                        />
                      )}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </FilterGroup>

        {/* Price */}

        <FilterGroup title="Price">
          <div className="space-y-1">
            {PRICE_OPTIONS.map(
              (option) => {
                const selected =
                  filters.minPrice ===
                    option.min &&
                  filters.maxPrice ===
                    option.max;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() =>
                      setPrice(
                        option.min,
                        option.max,
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      px-2
                      py-2
                      text-left
                      text-xs
                      transition-all
                      ${
                        selected
                          ? "bg-primary/10 text-primary-hover"
                          : "text-muted hover:bg-surface-elevated hover:text-foreground"
                      }
                    `}
                  >
                    <span>
                      {option.label}
                    </span>

                    {selected && (
                      <IconCheck
                        size={13}
                        stroke={2}
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </FilterGroup>

        {/* Rating */}

        <FilterGroup title="Rating">
          <div className="space-y-1">
            {RATING_OPTIONS.map(
              (option) => {
                const selected =
                  filters.minRating ===
                  option.value;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        minRating: selected
                          ? 0
                          : option.value,
                      })
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      px-2
                      py-2
                      text-xs
                      transition-all
                      ${
                        selected
                          ? "bg-primary/10 text-primary-hover"
                          : "text-muted hover:bg-surface-elevated hover:text-foreground"
                      }
                    `}
                  >
                    <span>
                      {option.label}
                    </span>

                    {selected && (
                      <IconCheck
                        size={13}
                        stroke={2}
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </FilterGroup>

        {/* Reset */}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          className="mt-5 w-full"
        >
          Reset Filters
        </Button>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        border-b
        border-border/60
        py-5
        last:border-b-0
      "
    >
      <div
        className="
          mb-3
          flex
          items-center
          justify-between
        "
      >
        <h3
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-[0.16em]
            text-foreground
          "
        >
          {title}
        </h3>

        <IconChevronDown
          size={13}
          className="text-muted"
        />
      </div>

      {children}
    </div>
  );
}
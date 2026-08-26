"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  IconAdjustmentsHorizontal,
  IconDeviceMobile,
  IconGift,
  IconSparkles,
  IconStar,
  IconSword,
  IconSwords,
} from "@tabler/icons-react";

interface ShopNavigationProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  onShowAll: () => void;
  activeCategory?: string;
}

const CATEGORY_ICONS: Record<string, typeof IconSparkles> = {
  Collectibles: IconSparkles,
  "Desk Toys": IconGift,
  Gaming: IconSwords,
  Custom: IconAdjustmentsHorizontal,
  Anime: IconStar,
  Heroes: IconSword,
  "Mobile / TV": IconDeviceMobile,
  "Weapon Props": IconSword,
};

const CATEGORY_SLUGS: Record<string, string> = {
  Collectibles: "collectibles",
  "Desk Toys": "desk-toys",
  Gaming: "gaming",
  Custom: "custom",
  Anime: "anime",
  Heroes: "heroes",
  "Mobile / TV": "mobile-tv",
  "Weapon Props": "weapon-props",
  "Custom Miniatures": "custom-miniatures",
};

export function ShopNavigation({
  categories,
  selectedCategories,
  onCategoryChange,
  onShowAll,
  activeCategory,
}: ShopNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const allSelected = !activeCategory && selectedCategories.length === 0;

  const handleCategory = (category: string) => {
    if (activeCategory) {
      onCategoryChange(category);
      return;
    }

    const slug = CATEGORY_SLUGS[category] ?? slugify(category);

    if (pathname === "/shop") {
      router.push(`/shop/${slug}`);
      return;
    }

    onCategoryChange(category);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <CategoryButton
          label="All Models"
          selected={allSelected}
          onClick={() => {
            if (activeCategory) {
              router.push("/shop");
            } else {
              onShowAll();
            }
          }}
          icon={IconSparkles}
        />

        {categories.map((category) => {
          const selected = activeCategory
            ? activeCategory === category
            : selectedCategories.includes(category);

          const Icon =
            CATEGORY_ICONS[category] ?? IconSparkles;

          return (
            <CategoryButton
              key={category}
              label={category}
              selected={selected}
              onClick={() => handleCategory(category)}
              icon={Icon}
            />
          );
        })}
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s*\/\s*/g, "-")
    .replace(/\s+/g, "-");
}

function CategoryButton({
  label,
  selected,
  onClick,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon: typeof IconSparkles;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[10px] font-medium tracking-[0.08em] transition-colors"
    >
      {selected ? (
        <motion.span
          layoutId="shop-category-active"
          className="absolute inset-0 rounded-full bg-primary"
          transition={{
            type: "spring",
            stiffness: 340,
            damping: 28,
          }}
        />
      ) : (
        <span className="pointer-events-none absolute inset-0 rounded-full border border-border/80 bg-surface/20 transition-colors group-hover:border-primary/30" />
      )}

      <Icon
        size={14}
        stroke={1.6}
        className={`relative z-10 ${
          selected ? "text-white" : "text-muted"
        }`}
      />

      <span
        className={`relative z-10 whitespace-nowrap ${
          selected ? "text-white" : "text-muted"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

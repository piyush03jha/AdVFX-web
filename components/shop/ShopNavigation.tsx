"use client";

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

export function ShopNavigation({ categories, selectedCategories, onCategoryChange, onShowAll }: ShopNavigationProps) {
  const allSelected = selectedCategories.length === 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <CategoryButton label="All Models" selected={allSelected} onClick={onShowAll} icon={IconSparkles} />
        {categories.map((category) => {
          const selected = selectedCategories.includes(category);
          const Icon = CATEGORY_ICONS[category] ?? IconSparkles;
          return (
            <CategoryButton
              key={category}
              label={category}
              selected={selected}
              onClick={() => onCategoryChange(category)}
              icon={Icon}
            />
          );
        })}
      </div>
    </div>
  );
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
    <button type="button" onClick={onClick} className="group relative flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[10px] font-medium tracking-[0.08em] transition-colors">
      {selected ? (
        <motion.span layoutId="shop-category-active" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 340, damping: 28 }} />
      ) : (
        <span className="pointer-events-none absolute inset-0 rounded-full border border-border/80 bg-surface/20 transition-colors group-hover:border-primary/30" />
      )}
      <Icon size={14} stroke={1.6} className={`relative z-10 ${selected ? "text-white" : "text-muted"}`} />
      <span className={`relative z-10 whitespace-nowrap ${selected ? "text-white" : "text-muted"}`}>{label}</span>
    </button>
  );
}
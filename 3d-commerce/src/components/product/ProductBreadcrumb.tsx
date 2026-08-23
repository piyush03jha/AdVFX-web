"use client";

import Link from "next/link";

import {
  IconChevronRight,
} from "@tabler/icons-react";

interface ProductBreadcrumbProps {
  category: string;
  productName: string;
}

export function ProductBreadcrumb({
  category,
  productName,
}: ProductBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="
        flex
        min-w-0
        items-center
        gap-2
        overflow-hidden
        text-[10px]
        uppercase
        tracking-[0.15em]
      "
    >
      <Link
        href="/shop"
        className="
          shrink-0
          text-muted
          transition-colors
          hover:text-primary
        "
      >
        Shop
      </Link>

      <IconChevronRight
        size={12}
        className="shrink-0 text-muted/40"
      />

      <Link
        href={`/shop?category=${encodeURIComponent(
          category,
        )}`}
        className="
          shrink-0
          text-muted
          transition-colors
          hover:text-primary
        "
      >
        {category}
      </Link>

      <IconChevronRight
        size={12}
        className="shrink-0 text-muted/40"
      />

      <span
        className="
          truncate
          text-foreground/60
        "
      >
        {productName}
      </span>
    </nav>
  );
}
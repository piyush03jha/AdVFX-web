"use client";

import {
  IconDownload,
  IconFile3d,
  IconShieldCheck,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";

import type { Product } from "@/config/products";

import { ProductActions } from "./ProductActions";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({
  product,
}: ProductInfoProps) {
  return (
    <div>
      {/* Category */}

      <div className="flex items-center gap-2">
        <span
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-[0.22em]
            text-primary
          "
        >
          {product.category}
        </span>

        {product.badge && (
          <Badge variant="primary">
            {product.badge}
          </Badge>
        )}
      </div>

      {/* Name */}

      <h1
        className="
          mt-4
          text-3xl
          font-semibold
          tracking-[-0.045em]
          text-foreground
          sm:text-4xl
          lg:text-5xl
        "
      >
        {product.name}
      </h1>

      {/* Rating */}

      <Rating
        value={product.rating}
        reviewCount={
          product.reviewCount
        }
        size={13}
        className="mt-4"
      />

      {/* Description */}

      <p
        className="
          mt-6
          max-w-xl
          text-sm
          leading-7
          text-muted
        "
      >
        {product.description}
      </p>

      {/* Price */}

      <div
        className="
          mt-7
          flex
          items-end
          gap-3
        "
      >
        <Price
          value={product.price}
          size="lg"
        />

        {product.oldPrice && (
          <span
            className="
              mb-1
              text-sm
              text-muted
              line-through
            "
          >
            ₹
            {product.oldPrice.toLocaleString(
              "en-IN",
            )}
          </span>
        )}

        {product.discount && (
          <Badge
            variant="success"
            className="mb-1"
          >
            {product.discount}
          </Badge>
        )}
      </div>

      <ProductActions
        product={product}
      />

      {/* Trust indicators */}

      <div
        className="
          mt-7
          grid
          grid-cols-3
          gap-2
          border-t
          border-border
          pt-6
        "
      >
        <TrustItem
          icon={<IconDownload size={15} />}
          label="Instant"
          value="Download"
        />

        <TrustItem
          icon={<IconFile3d size={15} />}
          label="Ready"
          value={product.format}
        />

        <TrustItem
          icon={<IconShieldCheck size={15} />}
          label="Secure"
          value="License"
        />
      </div>
    </div>
  );
}

function TrustItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        min-w-0
        flex-col
        items-center
        gap-1.5
        text-center
      "
    >
      <span className="text-primary">
        {icon}
      </span>

      <span
        className="
          text-[8px]
          uppercase
          tracking-[0.12em]
          text-muted
        "
      >
        {label}
      </span>

      <span
        className="
          truncate
          text-[10px]
          font-medium
          text-foreground
        "
      >
        {value}
      </span>
    </div>
  );
}
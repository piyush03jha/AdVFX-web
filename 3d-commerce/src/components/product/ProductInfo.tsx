import {
  IconBox,
  IconCheck,
  IconCube,
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
    <div
      className="
        rounded-[28px]
        border
        border-white/[0.08]
        bg-white/[0.025]
        p-5
        shadow-[0_20px_80px_rgba(0,0,0,0.22)]
        sm:p-7
        lg:p-8
      "
    >
      {/* ==================================================
          CATEGORY
      ================================================== */}

      <div className="flex flex-wrap items-center gap-2">
        {product.badge && (
          <Badge variant="primary">
            {product.badge}
          </Badge>
        )}

        <span
          className="
            rounded-full
            border
            border-white/[0.08]
            px-2.5
            py-1
            text-[9px]
            font-medium
            uppercase
            tracking-[0.15em]
            text-muted
          "
        >
          {product.category}
        </span>
      </div>

      {/* ==================================================
          TITLE
      ================================================== */}

      <h1
        className="
          mt-5
          max-w-xl
          font-serif
          text-4xl
          leading-[0.96]
          tracking-[-0.045em]
          text-foreground
          sm:text-5xl
          lg:text-[3.4rem]
        "
      >
        {product.name}
      </h1>

      {/* ==================================================
          RATING
      ================================================== */}

      <div
        className="
          mt-5
          flex
          flex-wrap
          items-center
          gap-3
        "
      >
        <Rating
          value={product.rating}
          reviewCount={product.reviewCount}
          size={13}
        />

        <span
          className="
            h-1
            w-1
            rounded-full
            bg-muted/40
          "
        />

        <span
          className="
            text-xs
            text-muted
          "
        >
          Highly rated model
        </span>
      </div>

      {/* ==================================================
          PRICE
      ================================================== */}

      <div
        className="
          mt-7
          flex
          flex-wrap
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
          <span
            className="
              mb-1
              rounded-md
              bg-primary/10
              px-2
              py-1
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-primary
            "
          >
            {product.discount}
          </span>
        )}
      </div>

      {/* ==================================================
          SHORT DESCRIPTION
      ================================================== */}

      <p
        className="
          mt-5
          max-w-xl
          text-sm
          leading-6
          text-muted
        "
      >
        {product.description}
      </p>

      {/* ==================================================
          ASSET SNAPSHOT
      ================================================== */}

      <div
        className="
          mt-6
          grid
          grid-cols-2
          gap-2
          sm:grid-cols-4
        "
      >
        <AssetStat
          icon={<IconFile3d size={15} />}
          label="Format"
          value={product.format}
        />

        <AssetStat
          icon={<IconBox size={15} />}
          label="Size"
          value={product.fileSize}
        />

        <AssetStat
          icon={<IconCube size={15} />}
          label="Polygons"
          value={product.polygonCount}
        />

        <AssetStat
          icon={<IconCheck size={15} />}
          label="Textures"
          value={
            product.textureResolution ??
            "Included"
          }
        />
      </div>

      {/* ==================================================
          PURCHASE ACTIONS
      ================================================== */}

      <ProductActions product={product} />

      {/* ==================================================
          TRUST
      ================================================== */}

      <div
        className="
          mt-7
          grid
          grid-cols-3
          border-t
          border-white/[0.07]
          pt-6
        "
      >
        <TrustItem
          icon={<IconDownload size={15} />}
          title="Instant"
          value="Download"
        />

        <TrustItem
          icon={<IconFile3d size={15} />}
          title="Ready"
          value="GLB"
        />

        <TrustItem
          icon={<IconShieldCheck size={15} />}
          title="Secure"
          value="License"
        />
      </div>
    </div>
  );
}

function AssetStat({
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
        rounded-xl
        border
        border-white/[0.07]
        bg-black/15
        p-3
      "
    >
      <div className="text-primary">
        {icon}
      </div>

      <p
        className="
          mt-2
          text-[8px]
          uppercase
          tracking-[0.15em]
          text-muted
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-xs
          font-medium
          text-foreground
        "
      >
        {value}
      </p>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        gap-1.5
        border-r
        border-white/[0.07]
        text-center
        last:border-r-0
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
        {title}
      </span>

      <span
        className="
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
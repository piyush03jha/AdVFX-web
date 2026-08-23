import {
  IconBox,
  IconCube,
  IconFile3d,
  IconTexture,
} from "@tabler/icons-react";

import type { Product } from "@/config/products";

interface ProductSpecsProps {
  product: Product;
}

export function ProductSpecs({
  product,
}: ProductSpecsProps) {
  return (
    <section
      className="
        border-t
        border-border
        pt-12
      "
    >
      <div className="mb-7">
        <p
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-[0.22em]
            text-primary
          "
        >
          Technical details
        </p>

        <h2
          className="
            mt-3
            text-2xl
            font-semibold
            tracking-[-0.035em]
            text-foreground
            sm:text-3xl
          "
        >
          Model Specifications
        </h2>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-4
        "
      >
        <Spec
          icon={<IconFile3d size={17} />}
          label="Format"
          value={product.format}
        />

        <Spec
          icon={<IconBox size={17} />}
          label="File Size"
          value={product.fileSize}
        />

        <Spec
          icon={<IconCube size={17} />}
          label="Polygons"
          value={product.polygonCount}
        />

        <Spec
          icon={<IconTexture size={17} />}
          label="Textures"
          value={
            product.textureResolution ??
            "Included"
          }
        />
      </div>
    </section>
  );
}

function Spec({
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
        rounded-2xl
        border
        border-border
        bg-surface
        p-4
        transition-colors
        hover:border-primary/30
      "
    >
      <div className="text-primary">
        {icon}
      </div>

      <p
        className="
          mt-4
          text-[9px]
          uppercase
          tracking-[0.16em]
          text-muted
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-medium
          text-foreground
        "
      >
        {value}
      </p>
    </div>
  );
}
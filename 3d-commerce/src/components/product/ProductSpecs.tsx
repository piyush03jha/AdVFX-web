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
  const specs = [
    {
      icon: <IconFile3d size={18} />,
      label: "Format",
      value: product.format,
    },
    {
      icon: <IconBox size={18} />,
      label: "File Size",
      value: product.fileSize,
    },
    {
      icon: <IconCube size={18} />,
      label: "Polygon Count",
      value: product.polygonCount,
    },
    {
      icon: <IconTexture size={18} />,
      label: "Texture Resolution",
      value:
        product.textureResolution ??
        "Included",
    },
  ];

  return (
    <div>
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
          Technical information
        </p>

        <h2
          className="
            mt-2
            font-serif
            text-2xl
            tracking-[-0.035em]
            text-foreground
            sm:text-3xl
          "
        >
          Model specifications
        </h2>
      </div>

      <div
        className="
          mt-7
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-4
        "
      >
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-black/15
              p-5
            "
          >
            <div className="text-primary">
              {spec.icon}
            </div>

            <p
              className="
                mt-5
                text-[9px]
                uppercase
                tracking-[0.16em]
                text-muted
              "
            >
              {spec.label}
            </p>

            <p
              className="
                mt-1.5
                text-sm
                font-medium
                text-foreground
              "
            >
              {spec.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
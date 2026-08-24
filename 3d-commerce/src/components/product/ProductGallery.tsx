"use client";

import Image from "next/image";
import { useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCube,
  IconPhoto,
} from "@tabler/icons-react";

import type { Product } from "@/config/products";

import { ProductViewer } from "./ProductViewer";

interface ProductGalleryProps {
  product: Product;
}

/**
 * Product media gallery
 *
 * Loading strategy:
 *
 * 1. Product image loads first.
 * 2. GLB viewer is mounted only when the 3D slide is selected.
 * 3. Additional product images can be added later through
 *    product.images without changing the gallery architecture.
 */
export function ProductGallery({
  product,
}: ProductGalleryProps) {
  const images =
    "images" in product &&
    Array.isArray(product.images)
      ? product.images
      : [];

  const media = [
    {
      type: "image" as const,
      src: product.image,
      label: "Preview",
    },

    {
      type: "3d" as const,
      src: product.model,
      label: "3D View",
    },

    ...images.slice(0, 3).map((src) => ({
      type: "image" as const,
      src,
      label: "Gallery",
    })),
  ];

  const [activeIndex, setActiveIndex] =
    useState(0);

  const activeMedia =
    media[activeIndex];

  const previous = () => {
    setActiveIndex((current) =>
      current === 0
        ? media.length - 1
        : current - 1,
    );
  };

  const next = () => {
    setActiveIndex((current) =>
      current === media.length - 1
        ? 0
        : current + 1,
    );
  };

  return (
    <div className="w-full">
      {/* ==================================================
          MAIN MEDIA
      ================================================== */}

      <div
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-[#0b0b0b]
          sm:rounded-3xl
        "
      >
        {/* IMAGE */}

        {activeMedia.type === "image" && (
          <div className="relative h-full w-full">
            <Image
              src={activeMedia.src}
              alt={product.name}
              fill
              priority={activeIndex === 0}
              sizes="
                (max-width: 640px) 100vw,
                (max-width: 1024px) 60vw,
                55vw
              "
              className="
                object-cover
                transition-transform
                duration-700
              "
            />

            {/* Cinematic overlay */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/30
                via-transparent
                to-transparent
              "
            />
          </div>
        )}

        {/* ==================================================
            3D VIEWER

            IMPORTANT:
            ProductViewer is only mounted when this slide
            becomes active. This prevents the GLB/WebGL
            scene from loading during the initial image load.
        ================================================== */}

        {activeMedia.type === "3d" && (
          <div className="h-full w-full">
            <ProductViewer
              model={product.model}
              name={product.name}
            />
          </div>
        )}

        {/* ==================================================
            MEDIA LABEL
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            left-4
            top-4
            z-20
            flex
            items-center
            gap-2
            rounded-full
            border
            border-white/10
            bg-black/45
            px-3
            py-1.5
            backdrop-blur-md
          "
        >
          {activeMedia.type === "3d" ? (
            <IconCube
              size={14}
              stroke={1.5}
              className="text-primary"
            />
          ) : (
            <IconPhoto
              size={14}
              stroke={1.5}
              className="text-primary"
            />
          )}

          <span
            className="
              text-[9px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-white/80
            "
          >
            {activeMedia.label}
          </span>
        </div>

        {/* ==================================================
            PREVIOUS / NEXT
        ================================================== */}

        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Previous product media"
              className="
                absolute
                left-3
                top-1/2
                z-20
                flex
                h-9
                w-9
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-black/45
                text-white
                backdrop-blur-md
                transition-all
                duration-300
                hover:bg-black/70
              "
            >
              <IconChevronLeft
                size={18}
                stroke={1.6}
              />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next product media"
              className="
                absolute
                right-3
                top-1/2
                z-20
                flex
                h-9
                w-9
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-black/45
                text-white
                backdrop-blur-md
                transition-all
                duration-300
                hover:bg-black/70
              "
            >
              <IconChevronRight
                size={18}
                stroke={1.6}
              />
            </button>
          </>
        )}
      </div>

      {/* ==================================================
          THUMBNAILS
      ================================================== */}

      <div
        className="
          mt-3
          grid
          grid-cols-4
          gap-2
          sm:gap-3
        "
      >
        {media.map(
          (item, index) => {
            const active =
              index === activeIndex;

            return (
              <button
                key={`${item.type}-${index}`}
                type="button"
                onClick={() =>
                  setActiveIndex(index)
                }
                aria-label={`View ${item.label}`}
                aria-current={
                  active
                    ? "true"
                    : undefined
                }
                className={`
                  group
                  relative
                  aspect-square
                  overflow-hidden
                  rounded-xl
                  border
                  bg-[#0b0b0b]
                  transition-all
                  duration-300
                  ${
                    active
                      ? "border-primary ring-1 ring-primary/40"
                      : "border-border hover:border-primary/40"
                  }
                `}
              >
                {/* IMAGE THUMBNAIL */}

                {item.type ===
                  "image" && (
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="120px"
                    className="
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />
                )}

                {/* 3D THUMBNAIL */}

                {item.type === "3d" && (
                  <>
                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-primary/10
                        via-surface
                        to-black
                      "
                    >
                      <IconCube
                        size={28}
                        stroke={1.2}
                        className="
                          text-primary
                          transition-transform
                          duration-300
                          group-hover:scale-110
                        "
                      />
                    </div>

                    <div
                      className="
                        absolute
                        inset-x-0
                        bottom-0
                        bg-gradient-to-t
                        from-black/70
                        to-transparent
                        px-2
                        pb-2
                        pt-5
                      "
                    >
                      <span
                        className="
                          text-[8px]
                          font-medium
                          uppercase
                          tracking-[0.12em]
                          text-white/80
                        "
                      >
                        Interactive 3D
                      </span>
                    </div>
                  </>
                )}

                {/* Active indicator */}

                {active && (
                  <span
                    className="
                      absolute
                      bottom-1.5
                      left-1/2
                      h-0.5
                      w-6
                      -translate-x-1/2
                      rounded-full
                      bg-primary
                    "
                  />
                )}
              </button>
            );
          },
        )}
      </div>

      {/* ==================================================
          MEDIA DESCRIPTION
      ================================================== */}

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          px-1
        "
      >
        <p
          className="
            text-[9px]
            uppercase
            tracking-[0.14em]
            text-muted
          "
        >
          {activeMedia.type === "3d"
            ? "Drag to rotate • Scroll to zoom"
            : "Product preview"}
        </p>

        <p
          className="
            text-[9px]
            tabular-nums
            text-muted
          "
        >
          {activeIndex + 1} /{" "}
          {media.length}
        </p>
      </div>
    </div>
  );
}
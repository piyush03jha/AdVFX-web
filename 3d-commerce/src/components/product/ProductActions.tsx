"use client";

import { useState } from "react";

import {
  IconCheck,
  IconHeart,
  IconMinus,
  IconPlus,
  IconShoppingCart,
  IconSparkles,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

import type { Product } from "@/config/products";

interface ProductActionsProps {
  product: Product;
}

const LICENSES = [
  {
    id: "personal",
    title: "Personal",
    description: "Individual projects",
  },
  {
    id: "commercial",
    title: "Commercial",
    description: "Client & commercial work",
  },
  {
    id: "studio",
    title: "Studio",
    description: "Professional teams",
  },
] as const;

type LicenseId =
  (typeof LICENSES)[number]["id"];

export function ProductActions({
  product,
}: ProductActionsProps) {
  const [license, setLicense] =
    useState<LicenseId>("personal");

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  const [liked, setLiked] =
    useState(false);

  const addToCart = () => {
    console.log("Add to cart", {
      productId: product.id,
      license,
      quantity,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  const buyNow = () => {
    console.log("Buy now", {
      productId: product.id,
      license,
      quantity,
    });
  };

  return (
    <div className="mt-7">
      {/* ==================================================
          LICENSE
      ================================================== */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p
            className="
              text-[9px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-primary
            "
          >
            Choose license
          </p>

          <button
            type="button"
            className="
              text-[9px]
              text-muted
              underline-offset-4
              hover:text-primary
              hover:underline
            "
          >
            License terms
          </button>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-2
            sm:grid-cols-3
          "
        >
          {LICENSES.map((item) => {
            const selected =
              license === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setLicense(item.id)
                }
                className={`
                  relative
                  rounded-xl
                  border
                  p-3
                  text-left
                  transition-all
                  duration-200
                  ${
                    selected
                      ? "border-primary/70 bg-primary/8"
                      : "border-white/[0.08] bg-white/[0.015] hover:border-primary/30"
                  }
                `}
              >
                {selected && (
                  <span
                    className="
                      absolute
                      right-2.5
                      top-2.5
                      flex
                      h-4
                      w-4
                      items-center
                      justify-center
                      rounded-full
                      bg-primary
                      text-white
                    "
                  >
                    <IconCheck size={10} />
                  </span>
                )}

                <span
                  className={`
                    block
                    text-xs
                    font-medium
                    ${
                      selected
                        ? "text-primary"
                        : "text-foreground"
                    }
                  `}
                >
                  {item.title}
                </span>

                <span
                  className="
                    mt-1
                    block
                    text-[9px]
                    leading-4
                    text-muted
                  "
                >
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          QUANTITY + WISHLIST
      ================================================== */}

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p
            className="
              mb-2
              text-[9px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-primary
            "
          >
            Quantity
          </p>

          <div
            className="
              flex
              h-10
              w-28
              items-center
              justify-between
              rounded-lg
              border
              border-white/[0.08]
              bg-white/[0.015]
            "
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() =>
                setQuantity((value) =>
                  Math.max(1, value - 1),
                )
              }
              className="
                flex
                h-full
                w-9
                items-center
                justify-center
                text-muted
                hover:text-foreground
              "
            >
              <IconMinus size={13} />
            </button>

            <span
              className="
                text-xs
                font-medium
                text-foreground
              "
            >
              {quantity}
            </span>

            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() =>
                setQuantity(
                  (value) => value + 1,
                )
              }
              className="
                flex
                h-full
                w-9
                items-center
                justify-center
                text-muted
                hover:text-foreground
              "
            >
              <IconPlus size={13} />
            </button>
          </div>
        </div>

        <IconButton
          label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          size="sm"
          variant="default"
          onClick={() =>
            setLiked(
              (value) => !value,
            )
          }
          className={
            liked
              ? "border-primary/50 bg-primary/10 text-primary"
              : ""
          }
        >
          <IconHeart
            size={17}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </IconButton>
      </div>

      {/* ==================================================
          BUY BUTTONS
      ================================================== */}

      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-2
          sm:grid-cols-2
        "
      >
        <Button
          type="button"
          onClick={addToCart}
          className="
            min-h-12
            bg-primary
            text-white
            shadow-[0_0_30px_var(--glow-primary)]
            hover:bg-primary-hover
          "
        >
          {added ? (
            <>
              <IconCheck size={17} />
              Added
            </>
          ) : (
            <>
              <IconShoppingCart size={17} />
              Add to Cart
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={buyNow}
          className="
            flex
            min-h-12
            items-center
            justify-center
            gap-2
            rounded-md
            border
            border-primary/60
            bg-transparent
            px-5
            text-xs
            font-medium
            uppercase
            tracking-[0.14em]
            text-primary
            transition-all
            hover:bg-primary/8
          "
        >
          <IconSparkles size={15} />
          Buy Now
        </button>
      </div>

      <p
        className="
          mt-3
          text-center
          text-[9px]
          text-muted
        "
      >
        Instant digital delivery after
        successful payment.
      </p>
    </div>
  );
}
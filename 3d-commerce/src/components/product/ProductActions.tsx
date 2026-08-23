"use client";

import { useState } from "react";

import {
  IconCheck,
  IconHeart,
  IconShoppingCart,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

interface ProductActionsProps {
  productId: string;
}

export function ProductActions({
  productId,
}: ProductActionsProps) {
  const [added, setAdded] =
    useState(false);

  const [liked, setLiked] =
    useState(false);

  const addToCart = () => {
    console.log(
      "Add to cart:",
      productId,
    );

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <div className="mt-7">
      <div
        className="
          flex
          gap-2
        "
      >
        <Button
          type="button"
          onClick={addToCart}
          className="
            min-h-12
            flex-1
            bg-primary
            text-white
            shadow-[0_0_28px_var(--glow-primary)]
            hover:bg-primary-hover
          "
        >
          {added ? (
            <>
              <IconCheck size={17} />
              Added to Cart
            </>
          ) : (
            <>
              <IconShoppingCart size={17} />
              Add to Cart
            </>
          )}
        </Button>

        <IconButton
          label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          size="lg"
          variant="default"
          onClick={() =>
            setLiked(
              (current) => !current,
            )
          }
          className={`
            h-12
            w-12
            shrink-0
            ${
              liked
                ? "border-primary/50 bg-primary/10 text-primary"
                : ""
            }
          `}
        >
          <IconHeart
            size={18}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </IconButton>
      </div>

      <p
        className="
          mt-3
          text-center
          text-[9px]
          uppercase
          tracking-[0.14em]
          text-muted
        "
      >
        Instant digital download
      </p>
    </div>
  );
}
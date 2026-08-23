"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

import {
  IconCheck,
  IconHeart,
  IconShoppingCart,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
}

export function ProductActions({
  product,
}: ProductActionsProps) {
  const [added, setAdded] =
    useState(false);

  const [liked, setLiked] =
    useState(false);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <div className="mt-7">
      {/* ACTIONS */}
      <div className="flex gap-2">
        {/* ADD TO CART */}
        <Button
          type="button"
          onClick={handleAddToCart}
          className="
            min-h-12
            flex-1
            bg-primary
            text-white
            shadow-[0_0_28px_var(--glow-primary)]
            transition-all
            duration-300
            hover:bg-primary-hover
            hover:shadow-[0_0_36px_var(--glow-primary)]
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

        {/* WISHLIST */}
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
            transition-all
            duration-300
            ${
              liked
                ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_20px_var(--glow-primary)]"
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

      {/* DOWNLOAD NOTE */}
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
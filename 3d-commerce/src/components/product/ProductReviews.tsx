"use client";

import {
  IconStar,
} from "@tabler/icons-react";

import type { Product } from "@/config/products";

interface ProductReviewsProps {
  product: Product;
}

const reviews = [
  {
    name: "Alex",
    rating: 5,
    text: "Excellent quality and very clean model.",
  },
  {
    name: "Jordan",
    rating: 5,
    text: "The model looks great in my scene.",
  },
  {
    name: "Sam",
    rating: 4,
    text: "Good detail and easy to work with.",
  },
];

export function ProductReviews({
  product,
}: ProductReviewsProps) {
  return (
    <section
      className="
        border-t
        border-border
        pt-12
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.22em]
              text-primary
            "
          >
            Collector feedback
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
            Reviews
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="
              flex
              items-center
              gap-1
            "
          >
            <IconStar
              size={18}
              fill="currentColor"
              className="text-primary"
            />

            <span
              className="
                text-lg
                font-semibold
                text-foreground
              "
            >
              {product.rating}
            </span>
          </div>

          <span
            className="
              text-xs
              text-muted
            "
          >
            {product.reviewCount} reviews
          </span>
        </div>
      </div>

      <div
        className="
          mt-7
          grid
          gap-3
          md:grid-cols-3
        "
      >
        {reviews.map((review) => (
          <article
            key={review.name}
            className="
              rounded-2xl
              border
              border-border
              bg-surface
              p-5
            "
          >
            <div className="flex gap-0.5">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <IconStar
                  key={index}
                  size={12}
                  fill={
                    index <
                    review.rating
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    index <
                    review.rating
                      ? "text-primary"
                      : "text-muted/30"
                  }
                />
              ))}
            </div>

            <p
              className="
                mt-4
                text-sm
                leading-6
                text-muted
              "
            >
              {review.text}
            </p>

            <p
              className="
                mt-4
                text-[10px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-foreground
              "
            >
              {review.name}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
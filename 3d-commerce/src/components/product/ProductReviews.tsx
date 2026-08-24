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
    <div>
      {/* ==================================================
          REVIEW SUMMARY
      ================================================== */}

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
              text-[9px]
              font-medium
              uppercase
              tracking-[0.2em]
              text-primary
            "
          >
            Collector feedback
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
            What buyers say
          </h2>
        </div>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div className="flex items-center gap-1">
            <IconStar
              size={17}
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

      {/* ==================================================
          REVIEW CARDS
      ================================================== */}

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
              border-white/[0.07]
              bg-black/15
              p-5
            "
          >
            <div className="flex gap-0.5">
              {Array.from({
                length: 5,
              }).map((_, index) => {
                const filled =
                  index < review.rating;

                return (
                  <IconStar
                    key={index}
                    size={12}
                    fill={
                      filled
                        ? "currentColor"
                        : "none"
                    }
                    className={
                      filled
                        ? "text-primary"
                        : "text-muted/30"
                    }
                  />
                );
              })}
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
                mt-5
                text-[9px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-foreground
              "
            >
              {review.name}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
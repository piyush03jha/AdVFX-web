"use client";

import { motion } from "motion/react";
import {
  IconQuote,
  IconStar,
} from "@tabler/icons-react";

import { Container } from "@/components/ui/Container";
import { reviews } from "@/config/reviews";

function Stars({
  rating,
}: {
  rating: number;
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <IconStar
            key={index}
            size={14}
            stroke={1.4}
            className={
              index < rating
                ? "fill-current text-primary"
                : "text-muted/25"
            }
          />
        ),
      )}
    </div>
  );
}

function Reviewer({
  review,
}: {
  review: (typeof reviews)[number];
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-primary/20
          bg-primary/5
          text-[10px]
          font-medium
          tracking-wide
          text-primary
        "
      >
        {review.initials}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">
          {review.name}
        </p>

        <p className="mt-0.5 text-[9px] text-muted">
          {review.location} · {review.date}
        </p>
      </div>
    </div>
  );
}

function ReviewProduct({
  product,
}: {
  product: string;
}) {
  return (
    <div className="mt-5 flex items-center gap-2">
      <span
        className="
          h-px
          w-5
          bg-primary/50
        "
      />

      <span
        className="
          text-[9px]
          font-medium
          uppercase
          tracking-[0.14em]
          text-primary
        "
      >
        {product}
      </span>
    </div>
  );
}

export function Reviews() {
  const featuredReview = reviews[0];
  const secondaryReviews = reviews.slice(1);

  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
      {/* =========================================
          BACKGROUND
      ========================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          -z-10
          h-[500px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-primary/[0.045]
          blur-[130px]
        "
      />

      <Container>
        {/* =========================================
            HEADER
        ========================================== */}

        <div
          className="
            mb-12
            flex
            flex-col
            gap-8
            lg:mb-14
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.24em]
                text-primary
              "
            >
              Reviews
            </p>

            <h2
              className="
                mt-4
                max-w-2xl
                font-serif
                text-4xl
                leading-[0.95]
                tracking-[-0.045em]
                text-foreground
                sm:text-5xl
                lg:text-6xl
              "
            >
              What Our
              <br />
              <span className="italic text-muted">
                Collectors Say
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-md
                text-sm
                leading-6
                text-muted
              "
            >
              Every piece. Every story.
              Every obsession.
            </p>
          </motion.div>

          {/* =====================================
              RATING SUMMARY
          ====================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              delay: 0.1,
            }}
            className="
              flex
              items-center
              gap-5
              border-l
              border-primary/30
              pl-5
            "
          >
            <div>
              <div
                className="
                  text-4xl
                  font-semibold
                  tracking-[-0.04em]
                  text-foreground
                "
              >
                4.9
              </div>

              <p className="mt-1 text-[10px] text-muted">
                Average rating
              </p>
            </div>

            <div>
              <Stars rating={5} />

              <p className="mt-1.5 text-[10px] text-muted">
                1,200+ verified reviews
              </p>
            </div>
          </motion.div>
        </div>

        {/* =========================================
            REVIEWS GRID
        ========================================== */}

        <div
          className="
            grid
            gap-4
            lg:grid-cols-[1.25fr_0.75fr]
          "
        >
          {/* =====================================
              FEATURED REVIEW
          ====================================== */}

          <motion.article
            initial={{
              opacity: 0,
              x: -25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              group
              relative
              flex
              min-h-[350px]
              flex-col
              justify-between
              overflow-hidden
              rounded-2xl
              border
              border-primary/20
              bg-surface
              p-7
              sm:p-9
              lg:p-10
            "
          >
            {/* Decorative quote */}

            <IconQuote
              aria-hidden="true"
              size={100}
              stroke={0.5}
              className="
                pointer-events-none
                absolute
                right-5
                top-3
                text-primary/[0.06]
                transition-transform
                duration-700
                group-hover:scale-110
              "
            />

            <div>
              <div className="flex items-center justify-between">
                <Stars
                  rating={
                    featuredReview.rating
                  }
                />

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.15em]
                    text-muted
                  "
                >
                  Verified collector
                </span>
              </div>

              <blockquote
                className="
                  mt-8
                  max-w-2xl
                  font-serif
                  text-2xl
                  leading-[1.3]
                  tracking-[-0.02em]
                  text-foreground
                  sm:text-3xl
                "
              >
                “
                {featuredReview.text}
                ”
              </blockquote>
            </div>

            <div className="mt-10 flex items-end justify-between gap-5">
              <Reviewer
                review={featuredReview}
              />

              <ReviewProduct
                product={
                  featuredReview.product
                }
              />
            </div>
          </motion.article>

          {/* =====================================
              SECONDARY REVIEWS
          ====================================== */}

          <div className="grid gap-4">
            {secondaryReviews.map(
              (review, index) => (
                <motion.article
                  key={review.id}
                  initial={{
                    opacity: 0,
                    x: 25,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  transition={{
                    duration: 0.6,
                    delay:
                      index * 0.08,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                  className="
                    group
                    flex
                    flex-col
                    justify-between
                    rounded-2xl
                    border
                    border-border/70
                    bg-surface/60
                    p-6
                    transition-all
                    duration-500
                    hover:border-primary/25
                    hover:bg-surface
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <Reviewer
                      review={review}
                    />

                    <Stars
                      rating={review.rating}
                    />
                  </div>

                  <p
                    className="
                      mt-5
                      text-sm
                      leading-6
                      text-muted
                    "
                  >
                    “{review.text}”
                  </p>

                  <ReviewProduct
                    product={review.product}
                  />
                </motion.article>
              ),
            )}
          </div>
        </div>

        {/* =========================================
            BOTTOM STATEMENT
        ========================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="
            mt-14
            flex
            items-center
            justify-center
            gap-4
          "
        >
          <span className="h-px w-10 bg-border" />

          <p
            className="
              text-center
              text-[10px]
              uppercase
              tracking-[0.18em]
              text-muted
            "
          >
            Made for people who notice
            the details
          </p>

          <span className="h-px w-10 bg-border" />
        </motion.div>
      </Container>
    </section>
  );
}
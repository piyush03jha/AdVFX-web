"use client";

import { motion, useReducedMotion } from "motion/react";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface ShopHeaderProps {
  productCount: number;
  onOpenFilters?: () => void;
}

export function ShopHeader({
  productCount,
  onOpenFilters,
}: ShopHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {/* Cinematic background */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[15%]
          top-0
          -z-10
          h-[280px]
          w-[420px]
          rounded-full
          bg-primary/[0.045]
          blur-[120px]
          sm:h-[380px]
          sm:w-[600px]
        "
      />

      <Container
        className="
          pb-8
          pt-12
          sm:pb-10
          sm:pt-16
          lg:pb-12
          lg:pt-20
        "
      >
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 18,
                }
          }
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          transition={{
            duration: 0.65,
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
            The Collection
          </p>

          <div
            className="
              mt-3
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <h1
                className="
                  text-4xl
                  font-semibold
                  tracking-[-0.055em]
                  text-foreground
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                Explore Models
              </h1>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-muted
                  sm:text-base
                  sm:leading-7
                "
              >
                Discover premium 3D assets,
                digital collectibles, and
                presentation-ready models.
              </p>
            </div>

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                sm:justify-end
              "
            >
              <span
                className="
                  text-xs
                  uppercase
                  tracking-[0.14em]
                  text-muted
                "
              >
                {productCount} models
              </span>

              {onOpenFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenFilters}
                  className="lg:hidden"
                >
                  <IconAdjustmentsHorizontal
                    size={15}
                  />

                  Filters
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
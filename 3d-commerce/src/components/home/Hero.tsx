"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { Container } from "@/components/ui/Container";
import { heroProducts } from "@/config/hero-products";

const CARD_POSITIONS = [
  { x: -31, y: 2, rotate: -8, scale: 0.78 },
  { x: 31, y: 2, rotate: 8, scale: 0.78 },
  { x: -16, y: 0, rotate: -4, scale: 0.9 },
  { x: 16, y: 0, rotate: 4, scale: 0.9 },
] as const;

function ModelImageCard({
  product,
  className = "",
}: {
  product: (typeof heroProducts)[number];
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden rounded-[16px] border border-white/15 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)] ${className}`}
    >
      <img
        src={product.image ?? `/models/products/${product.id}.jpg`}
        alt={product.name}
        className="h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export function Hero() {
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, {
    stiffness: 120,
    damping: 28,
    mass: 0.7,
  });

  const leftCardX = useTransform(smoothProgress, [0, 1], [-100, -31]);
  const rightCardX = useTransform(smoothProgress, [0, 1], [100, 31]);
  const leftCardY = useTransform(smoothProgress, [0, 1], [120, 2]);
  const rightCardY = useTransform(smoothProgress, [0, 1], [120, 2]);
  const sideOpacity = useTransform(smoothProgress, [0, 0.18, 1], [0, 0.9, 1]);
  const sideScale = useTransform(smoothProgress, [0, 1], [0.7, 0.78]);
  const titleY = useTransform(smoothProgress, [0, 1], [-10, 0]);
  const descriptionY = useTransform(smoothProgress, [0, 1], [12, 0]);

  const firstProduct = heroProducts[0];
  const sideProducts = heroProducts.slice(1, 3);

  return (
    <section
      className="relative isolate overflow-hidden bg-black text-white"
      aria-label="Featured 3D collection"
    >
      <div className="relative h-[100svh] min-h-[720px]">
        <Container className="relative h-full py-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.07),transparent_31%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.035),transparent_40%)]"
          />

          <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between pt-8 sm:pt-10 lg:pt-12">
            <div className="max-w-[320px]">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/50 sm:text-[10px]">
                ZEVANA / DIGITAL FASHION
              </p>
              <motion.p
                style={{ y: descriptionY }}
                className="mt-2 max-w-[280px] text-[11px] leading-5 text-white/60 sm:text-xs sm:leading-6"
              >
                Premium digital fashion assets built for visual commerce,
                campaign imagery, and cinematic presentation.
              </motion.p>
            </div>

            <motion.div style={{ y: titleY }} className="max-w-[520px] text-right">
              <h1 className="text-[clamp(2.5rem,5.4vw,5.6rem)] font-light uppercase leading-[0.9] tracking-[-0.055em]">
                {firstProduct.name}
              </h1>
              <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
                Featured model
              </p>
            </motion.div>
          </div>

          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="relative h-[63svh] w-[min(72vw,430px)] min-w-[280px] sm:h-[68svh] sm:w-[min(46vw,470px)]">
              <div className="absolute inset-[14%] rounded-full bg-white/[0.035] blur-3xl" />
              <ModelImageCard product={firstProduct} className="h-full w-full" />
            </div>

            {sideProducts.map((product, index) => {
              const sideX = index === 0 ? leftCardX : rightCardX;
              const sideY = index === 0 ? leftCardY : rightCardY;

              return (
                <motion.div
                  key={product.id}
                  style={{
                    x: useTransform(sideX, (value) => `${value}vw`),
                    y: useTransform(sideY, (value) => `${value}px`),
                    opacity: sideOpacity,
                    scale: sideScale,
                    rotate: CARD_POSITIONS[index].rotate,
                  }}
                  className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[clamp(110px,15vw,190px)] -translate-x-1/2 -translate-y-1/2 sm:block"
                >
                  <ModelImageCard product={product} className="w-full" />
                </motion.div>
              );
            })}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between pb-7 sm:pb-8 lg:pb-10">
            <div className="max-w-[340px]">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                Scroll to explore
              </p>
              <div className="mt-3 h-px w-28 overflow-hidden bg-white/12">
                <motion.div
                  style={{ scaleX: smoothProgress }}
                  className="h-full origin-left bg-white/60"
                />
              </div>
            </div>

            <div className="text-right text-[9px] uppercase tracking-[0.2em] text-white/30">
              01 — 05
            </div>
          </div>
        </Container>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-black to-transparent"
      />
    </section>
  );
}

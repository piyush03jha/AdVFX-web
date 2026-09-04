"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { IconShoppingCart } from "@tabler/icons-react";

import { heroProducts } from "@/config/hero-products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Price } from "@/components/ui/Price";

const SCROLL_HEIGHT = "390svh";
const IMAGE_WIDTH = "clamp(74px, 17vw, 250px)";
const IMAGE_HEIGHT = "clamp(150px, 31.9vw, 500px)";
const PRODUCT_GAP = "clamp(5px, 0.8vw, 12px)";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * The final editorial row uses one shared image footprint for every product.
 * This is deliberately independent from the earlier fan composition so the
 * production assets can later be swapped without changing the choreography.
 */
const FINAL_X = [-34, -17, 0, 17, 34] as const;

function ProductInfoCard({
  product,
  progress,
}: {
  product: (typeof heroProducts)[number];
  progress: ReturnType<typeof useMotionValue<number>>;
}) {
  const reveal = useTransform(progress, [0.82, 0.93], [0, 1]);
  const y = useTransform(reveal, [0, 1], [110, 0]);
  const opacity = useTransform(reveal, [0, 0.3, 1], [0, 0.5, 1]);

  return (
    <motion.div
      className="pointer-events-auto absolute left-0 top-full mt-[var(--product-gap)] w-full"
      style={{ y, opacity, "--product-gap": PRODUCT_GAP } as React.CSSProperties}
    >
      <Card className="overflow-hidden rounded-[10px] border-black/10 bg-white text-black shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:rounded-[14px]">
        <div className="p-2.5 sm:p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[7px] font-medium uppercase tracking-[0.14em] text-black/45 sm:text-[8px]">
                {product.category}
              </p>
              <h3 className="mt-1 line-clamp-2 text-[10px] font-medium leading-[1.2] tracking-[-0.02em] sm:text-[12px]">
                {product.name}
              </h3>
            </div>
            <Badge variant="default" className="shrink-0 border-black/10 bg-black/[0.04] text-[7px] text-black/55 sm:text-[8px]">
              3D
            </Badge>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-black/10 pt-2.5 sm:mt-3 sm:pt-3">
            <Price value={product.price} size="sm" />
            <Button type="button" size="sm" variant="primary" className="h-7 px-2 text-[8px] sm:h-8 sm:px-2.5 sm:text-[9px]">
              <IconShoppingCart size={12} />
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function HeroProduct({
  product,
  progress,
  side,
  depth,
  finalIndex,
}: {
  product: (typeof heroProducts)[number];
  progress: ReturnType<typeof useMotionValue<number>>;
  side: "left" | "right";
  depth: "inner" | "outer" | "center";
  finalIndex: number;
}) {
  const isLeft = side === "left";
  const isOuter = depth === "outer";
  const isCenter = depth === "center";
  const direction = isLeft ? -1 : 1;

  const start = isCenter ? 0 : isOuter ? 0.30 : 0.045;
  const end = isCenter ? 0.08 : isOuter ? 0.58 : 0.25;

  const initialX = isCenter ? 0 : isOuter ? 35 : 18;
  const initialY = isCenter ? 0 : isOuter ? -5 : -40;
  const initialWidth = isCenter ? "clamp(92px, 24vw, 360px)" : "clamp(70px, 15vw, 270px)";

  const reveal = useTransform(progress, [start, end], [0, 1]);
  const fanX = useTransform(reveal, [0, 0.55, 1], [0, direction * 2, direction * initialX]);
  const fanY = useTransform(reveal, [0, 0.55, 1], [0, isOuter ? 0 : -5, initialY]);
  const x = useTransform(fanX, (value) => `${value}vw`);
  const y = useTransform(fanY, (value) => `${value}px`);

  // Once the white stage is complete, all five models settle into one evenly
  // sized row. The information card follows the model because it lives inside
  // the same product wrapper.
  const finalX = useTransform(progress, [0.78, 0.94], [initialX * direction, FINAL_X[finalIndex]]);
  const finalY = useTransform(progress, [0.78, 0.94], [initialY, -125]);
  const finalWidth = useTransform(progress, [0.78, 0.94], [initialWidth, IMAGE_WIDTH]);
  const finalHeight = useTransform(progress, [0.78, 0.94], [IMAGE_HEIGHT, IMAGE_HEIGHT]);
  const combinedX = useTransform([fanX, finalX], ([fan, target]) => {
    const f = fan as number;
    const t = target as number;
    return `${progress.get() < 0.78 ? f : t}vw`;
  });
  const combinedY = useTransform([fanY, finalY], ([fan, target]) => {
    const f = fan as number;
    const t = target as number;
    return `${progress.get() < 0.78 ? f : t}px`;
  });

  const width = useTransform(progress, (value) => {
    const p = value as number;
    if (p < 0.78) return initialWidth;
    const t = clamp((p - 0.78) / 0.16, 0, 1);
    return `calc(${initialWidth} + (${IMAGE_WIDTH} - ${initialWidth}) * ${t})`;
  });

  const opacity = useTransform(reveal, [0, 0.1, 0.45, 1], [0, 0.5, 0.9, 1]);
  const chromeOpacity = useTransform(progress, [0.62, 0.76, 0.88], [1, 0.35, 0]);
  const imageInset = useTransform(progress, [0.62, 0.88], [isCenter ? "8px" : "6px", "0px"]);
  const rotateY = useTransform(reveal, [0, 0.35, 1], [0, isLeft ? 10 : -10, isLeft ? 20 : -20]);
  const rowOpacity = useTransform(progress, [0.82, 0.9], [0, 1]);

  return (
    <motion.article
      style={{
        x: combinedX,
        y: combinedY,
        width,
        height: finalHeight,
        scale: useTransform(progress, [0.78, 0.94], [1, 0.96]),
        opacity,
        rotateY,
        zIndex: isCenter ? 20 : isOuter ? 10 : 15,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 50%",
      }}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-[16px] bg-white shadow-[0_25px_70px_rgba(0,0,0,0.34)] sm:rounded-[22px]"
        style={{ opacity: chromeOpacity }}
      />

      <motion.div className="absolute inset-0 overflow-visible" style={{ padding: imageInset }}>
        <div className="h-full w-full overflow-hidden rounded-[12px] sm:rounded-[17px]">
          <img
            src={product.image ?? product.model}
            alt={product.name}
            loading="eager"
            decoding="async"
            fetchPriority={isCenter ? "high" : undefined}
            className="h-full w-full object-contain"
          />
        </div>

        <motion.div style={{ opacity: rowOpacity }}>
          <ProductInfoCard product={product} progress={progress} />
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export function HeroParallax() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useMotionValue(0);
  const smooth = useSpring(progress, { stiffness: 105, damping: 26, mass: 0.7 });

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
      progress.set(clamp(-rect.top / distance, 0, 1));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [progress]);

  const whiteStageY = useTransform(smooth, [0.58, 0.72, 0.86], ["100%", "42%", "0%"]);
  const whiteStageOpacity = useTransform(smooth, [0.58, 0.64], [0, 1]);

  // Five visual slots. Product data is reused until the five final production
  // assets are supplied; each slot is still independently wired to a product.
  const products = [
    heroProducts[2],
    heroProducts[3],
    heroProducts[0],
    heroProducts[1],
    heroProducts[2],
  ];

  return (
    <section
      ref={sectionRef}
      aria-label="Featured 3D collection"
      className="relative bg-black text-white"
      style={{ minHeight: SCROLL_HEIGHT }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black" />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-full bg-white"
          style={{ y: whiteStageY, opacity: whiteStageOpacity }}
        />

        <div className="absolute inset-x-0 top-0 z-40 flex items-start justify-between px-5 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-10">
          <p className="max-w-[280px] text-[8px] uppercase leading-[1.55] tracking-[0.13em] text-white/55 sm:text-[9px] lg:max-w-[340px]">
            A new language of digital fashion — designed to move like a campaign, not a carousel.
          </p>
          <h1 className="max-w-[360px] text-right text-[clamp(24px,3.2vw,48px)] font-light uppercase leading-[0.9] tracking-[-0.055em] sm:max-w-[500px]">
            DESIGNED TO MAKE
            <br />
            <span className="italic">AN ENTRANCE.</span>
          </h1>
        </div>

        <HeroProduct product={products[0]} progress={smooth} side="left" depth="outer" finalIndex={0} />
        <HeroProduct product={products[1]} progress={smooth} side="left" depth="inner" finalIndex={1} />
        <HeroProduct product={products[2]} progress={smooth} side="left" depth="center" finalIndex={2} />
        <HeroProduct product={products[3]} progress={smooth} side="right" depth="inner" finalIndex={3} />
        <HeroProduct product={products[4]} progress={smooth} side="right" depth="outer" finalIndex={4} />

        <div className="absolute bottom-6 left-5 right-5 z-40 flex items-end justify-between sm:bottom-8 sm:left-8 sm:right-8 lg:left-12 lg:right-12">
          <div>
            <p className="text-[8px] uppercase tracking-[0.22em] text-white/40 sm:text-[9px]">Scroll to explore</p>
            <div className="mt-2 h-px w-24 overflow-hidden bg-white/15 sm:w-32">
              <motion.div style={{ scaleX: smooth }} className="h-full origin-left bg-white" />
            </div>
          </div>
          <p className="text-[8px] uppercase tracking-[0.2em] text-white/35 sm:text-[9px]">ZEVANA / 01 — 05</p>
        </div>
      </div>
    </section>
  );
}

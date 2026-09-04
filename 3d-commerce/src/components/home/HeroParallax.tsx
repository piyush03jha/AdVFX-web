"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

import { heroProducts } from "@/config/hero-products";

const SCROLL_HEIGHT = "360svh";
const CARD_HEIGHT = "clamp(123px, 31.9vw, 480px)";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function HeroCard({
  product,
  progress,
  side,
  depth,
}: {
  product: (typeof heroProducts)[number];
  progress: ReturnType<typeof useMotionValue<number>>;
  side: "left" | "right";
  depth: "inner" | "outer";
}) {
  const isLeft = side === "left";
  const isOuter = depth === "outer";
  const direction = isLeft ? -1 : 1;

  const start = isOuter ? 0.30 : 0.045;
  const end = isOuter ? 0.58 : 0.25;

  // Side cards use the same HEIGHT as the center card.
  // Their WIDTH is intentionally smaller to create the fan composition.
  const sideWidth = "clamp(58px, 15vw, 230px)";

  // Equal visual gaps: outer cards sit one side-card width + the same gap
  // beyond the inner cards, producing 5 — 4 — CENTER — 2 — 3.
  const finalX = isOuter ? 37.5 : 21;
  const finalY = isOuter ? -5 : -15;

  const reveal = useTransform(progress, [start, end], [0, 1]);
  const xValue = useTransform(
    reveal,
    [0, 0.55, 1],
    [0, direction * 2, direction * finalX],
  );
  const yValue = useTransform(
    reveal,
    [0, 0.55, 1],
    [0, isOuter ? 0 : -5, finalY],
  );
  const x = useTransform(xValue, (value) => `${value}vw`);
  const y = useTransform(yValue, (value) => `${value}px`);
  const scale = useTransform(reveal, [0, 0.35, 1], [0.78, 0.9, 1]);
  const opacity = useTransform(reveal, [0, 0.1, 0.45, 1], [0, 0.5, 0.9, 1]);

  // Y-axis perspective tilt: vertical edges remain parallel and each card
  // faces inward toward the center without a diagonal 2D rotation.
  const rotateY = useTransform(
    reveal,
    [0, 0.35, 1],
    [0, isLeft ? 8 : -8, isLeft ? 18 : -18],
  );

  return (
    <motion.article
      style={{
        x,
        y,
        width: sideWidth,
        height: CARD_HEIGHT,
        scale,
        opacity,
        rotateY,
        zIndex: isOuter ? 10 : 15,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 50%",
      }}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="h-full w-full overflow-hidden rounded-[16px] bg-white p-1.5 shadow-[0_25px_70px_rgba(0,0,0,0.34)] sm:rounded-[22px] sm:p-2">
        <div className="h-full w-full overflow-hidden rounded-[12px] bg-white sm:rounded-[17px]">
          <img
            src={product.image ?? product.model}
            alt={product.name}
            loading="eager"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </motion.article>
  );
}

function CenterCard({
  product,
  progress,
}: {
  product: (typeof heroProducts)[number];
  progress: ReturnType<typeof useMotionValue<number>>;
}) {
  const scrollY = useTransform(progress, [0, 0.3, 0.65, 1], [0, -10, -18, -30]);
  const scale = useTransform(progress, [0, 0.25, 0.65, 1], [1, 1, 0.98, 0.94]);

  return (
    <motion.div
      initial={{ y: "115vh", opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 1.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-1/2 top-1/2 z-20 w-[clamp(92px,24vw,360px)] -translate-x-1/2 -translate-y-1/2"
      style={{ height: CARD_HEIGHT }}
    >
      <motion.div style={{ y: scrollY, scale }} className="h-full w-full">
        <div className="h-full w-full overflow-hidden rounded-[20px] bg-white p-2 shadow-[0_35px_100px_rgba(0,0,0,0.4)] sm:rounded-[28px] sm:p-3">
          <div className="relative h-full w-full overflow-hidden rounded-[15px] bg-white sm:rounded-[22px]">
            <img
              src={product.image ?? product.model}
              alt={product.name}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HeroParallax() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useMotionValue(0);
  const smooth = useSpring(progress, {
    stiffness: 105,
    damping: 26,
    mass: 0.7,
  });

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

  // Spatial order: 5 — 4 — CENTER — 2 — 3.
  const leftInner = heroProducts[3];
  const rightInner = heroProducts[1];
  const leftOuter = heroProducts[2];
  const rightOuter = heroProducts[0];

  return (
    <section
      ref={sectionRef}
      aria-label="Featured 3D collection"
      className="relative bg-black text-white"
      style={{ minHeight: SCROLL_HEIGHT }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black" />

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

        <HeroCard product={leftOuter} progress={smooth} side="left" depth="outer" />
        <HeroCard product={rightOuter} progress={smooth} side="right" depth="outer" />
        <HeroCard product={leftInner} progress={smooth} side="left" depth="inner" />
        <HeroCard product={rightInner} progress={smooth} side="right" depth="inner" />

        <CenterCard product={heroProducts[0]} progress={smooth} />

        <div className="absolute bottom-6 left-5 right-5 z-40 flex items-end justify-between sm:bottom-8 sm:left-8 sm:right-8 lg:left-12 lg:right-12">
          <div>
            <p className="text-[8px] uppercase tracking-[0.22em] text-white/40 sm:text-[9px]">
              Scroll to explore
            </p>
            <div className="mt-2 h-px w-24 overflow-hidden bg-white/15 sm:w-32">
              <motion.div style={{ scaleX: smooth }} className="h-full origin-left bg-white" />
            </div>
          </div>
          <p className="text-[8px] uppercase tracking-[0.2em] text-white/35 sm:text-[9px]">
            ZEVANA / 01 — 05
          </p>
        </div>
      </div>
    </section>
  );
}

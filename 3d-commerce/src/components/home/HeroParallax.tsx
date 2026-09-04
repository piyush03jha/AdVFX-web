"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

import { heroProducts } from "@/config/hero-products";

const SCROLL_HEIGHT = "360svh";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function HeroCard({
  product,
  progress,
  side,
  stage,
}: {
  product: (typeof heroProducts)[number];
  progress: ReturnType<typeof useMotionValue<number>>;
  side: "left" | "right";
  stage: 1 | 2;
}) {
  const direction = side === "left" ? -1 : 1;

  // Each card begins directly underneath the center card and travels outward.
  // This creates the impression that the cards are physically coming from
  // behind the hero card instead of simply fading in beside it.
  const start = stage === 1 ? 0.055 : 0.34;
  const end = stage === 1 ? 0.22 : 0.54;
  const finalX = stage === 1 ? 28 : 53;
  const finalRotate = direction * (stage === 1 ? 7 : 10);

  const reveal = useTransform(progress, [start, end], [0, 1]);
  const x = useTransform(reveal, [0, 0.72, 1], [0, direction * 9, direction * finalX]);
  const y = useTransform(reveal, [0, 0.72, 1], [0, -8, 0]);
  const scale = useTransform(reveal, [0, 0.35, 1], [0.9, 0.96, 1]);
  const opacity = useTransform(reveal, [0, 0.12, 0.5, 1], [0, 0.55, 0.9, 1]);
  const rotation = useTransform(reveal, [0, 1], [0, finalRotate]);

  return (
    <motion.article
      style={{
        x: useTransform(x, (value) => `${value}vw`),
        y: useTransform(y, (value) => `${value}px`),
        scale,
        opacity,
        rotate: rotation,
        transformOrigin: "50% 50%",
      }}
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[clamp(92px,24vw,360px)] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] bg-white p-2 shadow-[0_35px_100px_rgba(0,0,0,0.34)] sm:rounded-[28px] sm:p-3">
        <div className="h-full w-full overflow-hidden rounded-[15px] bg-white sm:rounded-[22px]">
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
    >
      <motion.div style={{ y: scrollY, scale }} className="w-full">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] bg-white p-2 shadow-[0_35px_100px_rgba(0,0,0,0.4)] sm:rounded-[28px] sm:p-3">
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
  const [rawProgress, setRawProgress] = useState(0);
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
      const next = clamp(-rect.top / distance, 0, 1);

      setRawProgress(next);
      progress.set(next);
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

  const firstPairOpacity = clamp((rawProgress - 0.025) / 0.12, 0, 1);
  const secondPairOpacity = clamp((rawProgress - 0.30) / 0.14, 0, 1);

  const leftFirst = heroProducts[1];
  const rightFirst = heroProducts[2];
  const leftSecond = heroProducts[3];
  const rightSecond = heroProducts[0];

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

        {/* Side cards deliberately sit behind the center card (z-10 vs z-20). */}
        <HeroCard product={leftFirst} progress={smooth} side="left" stage={1} />
        <HeroCard product={rightFirst} progress={smooth} side="right" stage={1} />
        <HeroCard product={leftSecond} progress={smooth} side="left" stage={2} />
        <HeroCard product={rightSecond} progress={smooth} side="right" stage={2} />

        <CenterCard product={heroProducts[0]} progress={smooth} />

        <div className="absolute bottom-6 left-5 right-5 z-40 flex items-end justify-between sm:bottom-8 sm:left-8 sm:right-8 lg:left-12 lg:right-12">
          <div>
            <p className="text-[8px] uppercase tracking-[0.22em] text-white/40 sm:text-[9px]">
              Scroll to explore
            </p>
            <div className="mt-2 h-px w-24 overflow-hidden bg-white/15 sm:w-32">
              <motion.div
                style={{ scaleX: smooth }}
                className="h-full origin-left bg-white"
              />
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

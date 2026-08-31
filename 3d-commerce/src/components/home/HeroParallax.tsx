"use client";

import { useEffect, useRef } from "react";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

import { heroProducts } from "@/config/hero-products";

const STICKY_HEIGHT = "100svh";

function ParallaxCard({
  product,
  index,
  progress,
}: {
  product: (typeof heroProducts)[number];
  index: number;
  progress: ReturnType<typeof useMotionValue<number>>;
}) {
  const center = index * 0.22;
  const y = useTransform(progress, [center - 0.16, center, center + 0.16], [120, 0, -120]);
  const x = useTransform(progress, [center - 0.18, center, center + 0.18], [index % 2 === 0 ? -90 : 90, 0, index % 2 === 0 ? 90 : -90]);
  const opacity = useTransform(progress, [center - 0.18, center - 0.06, center + 0.06, center + 0.18], [0, 1, 1, 0]);
  const scale = useTransform(progress, [center - 0.18, center, center + 0.18], [0.84, 1, 0.86]);

  return (
    <motion.article
      style={{ x, y, opacity, scale }}
      className="absolute left-1/2 top-1/2 w-[min(34vw,360px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/15 bg-white/8 shadow-2xl backdrop-blur-xl"
    >
      <div className="relative aspect-[3/4] bg-white/[0.03]">
        <img src={`/models/products/${index + 1}.png`} alt="" className="h-full w-full object-contain" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent p-5 pt-16 text-white">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">{product.category}</p>
          <h3 className="mt-1 text-xl font-medium tracking-tight">{product.name}</h3>
        </div>
      </div>
    </motion.article>
  );
}

function HeroParallaxScene() {
  const rawProgress = useMotionValue(0);
  const progress = useSpring(rawProgress, { stiffness: 110, damping: 24, mass: 0.7 });
  const bgY = useTransform(progress, [0, 1], [0, -110]);
  const headingY = useTransform(progress, [0, 1], [0, -55]);
  const modelX = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [120, 0, -85, 70, 0]);
  const modelScale = useTransform(progress, [0, 0.2, 0.5, 0.8, 1], [0.76, 1, 0.91, 0.94, 1.04]);
  const modelRotate = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [4, 0, -4, 3, 0]);
  const modelOpacity = useTransform(progress, [0, 0.08, 0.9, 1], [0, 1, 1, 0.95]);

  return (
    <div className="relative h-[500svh] bg-[#f7f6f3] text-[#0b0b0b]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.96),rgba(247,246,243,0.5)_38%,rgba(226,223,216,0.24)_72%,rgba(214,209,201,0.2))]" />
          <div className="absolute -left-[12%] top-[18%] h-[45vw] w-[45vw] rounded-full bg-black/[0.03] blur-3xl" />
          <div className="absolute -right-[10%] bottom-[8%] h-[38vw] w-[38vw] rounded-full bg-black/[0.025] blur-3xl" />
        </motion.div>

        <motion.div style={{ y: headingY }} className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 pb-6 pt-7 md:px-12 md:pt-10">
          <p className="max-w-[230px] text-[9px] uppercase leading-[1.45] tracking-[0.14em] text-black/55 md:max-w-[290px]">
            Premium digital fashion assets. Built for visual commerce, campaign imagery and cinematic product presentations.
          </p>
          <div className="max-w-[360px] text-right md:max-w-[520px]">
            <p className="text-[clamp(22px,3vw,44px)] font-light leading-[0.95] tracking-[-0.04em]">
              DESIGNED TO MAKE
              <br />
              <span className="italic">AN ENTRANCE.</span>
            </p>
          </div>
        </motion.div>

        <motion.div style={{ x: modelX, scale: modelScale, rotate: modelRotate, opacity: modelOpacity }} className="absolute left-1/2 top-1/2 z-20 h-[68svh] w-[42vw] min-w-[280px] max-w-[540px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-black/[0.04] blur-3xl" />
          <img src="/hero/model-1.webp" alt="Featured 3D model" className="relative h-full w-full object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.13)]" />
        </motion.div>

        {heroProducts.slice(0, 4).map((product, index) => (
          <ParallaxCard key={product.id} product={product} index={index + 1} progress={progress} />
        ))}

        <div className="absolute bottom-0 left-0 right-0 z-30 flex items-end justify-between px-6 pb-7 md:px-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-black/45">Scroll to explore</p>
            <div className="mt-2 h-px w-28 overflow-hidden bg-black/15">
              <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-black" />
            </div>
          </div>
          <div className="text-right text-[10px] uppercase tracking-[0.22em] text-black/45">ZEVANA / 3D COLLECTION</div>
        </div>
      </div>
    </div>
  );
}

export function HeroParallax() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const total = Math.max(sectionRef.current.offsetHeight - window.innerHeight, 1);
      const scrolled = Math.min(Math.max(-rect.top / total, 0), 1);
      const event = new CustomEvent("hero-parallax-progress", { detail: scrolled });
      window.dispatchEvent(event);
      raf = 0;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return <section ref={sectionRef} aria-label="Featured 3D collection"><HeroParallaxProgressBridge /></section>;
}

function HeroParallaxProgressBridge() {
  const rawProgress = useMotionValue(0);

  useEffect(() => {
    const handler = (event: Event) => {
      const progress = (event as CustomEvent<number>).detail;
      rawProgress.set(progress);
    };

    window.addEventListener("hero-parallax-progress", handler);
    return () => window.removeEventListener("hero-parallax-progress", handler);
  }, [rawProgress]);

  return <HeroParallaxCanvas progress={rawProgress} />;
}

function HeroParallaxCanvas({ progress }: { progress: ReturnType<typeof useMotionValue<number>> }) {
  const smooth = useSpring(progress, { stiffness: 120, damping: 25, mass: 0.65 });
  const bgY = useTransform(smooth, [0, 1], [0, -100]);
  const modelX = useTransform(smooth, [0, 0.2, 0.4, 0.6, 0.8, 1], [140, 0, -90, 100, -60, 0]);
  const modelScale = useTransform(smooth, [0, 0.2, 0.45, 0.7, 1], [0.82, 1, 0.9, 0.94, 1.02]);
  const rotate = useTransform(smooth, [0, 0.25, 0.5, 0.75, 1], [5, 0, -3, 4, 0]);
  const modelOpacity = useTransform(smooth, [0, 0.07, 0.92, 1], [0, 1, 1, 0.96]);

  return (
    <div className="relative h-[500svh] bg-[#f7f6f3] text-black">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.98),rgba(247,246,243,0.72)_42%,rgba(225,221,213,0.28)_100%)]" />

        <div className="absolute left-6 top-7 z-30 max-w-[260px] text-[9px] uppercase leading-[1.5] tracking-[0.12em] text-black/55 md:left-12 md:top-10 md:max-w-[340px]">
          A new language of digital fashion — designed to move like a campaign, not a carousel.
        </div>

        <div className="absolute right-6 top-7 z-30 text-right md:right-12 md:top-10">
          <div className="text-[clamp(24px,3vw,46px)] font-light leading-[0.92] tracking-[-0.05em]">DESIGNED TO MAKE</div>
          <div className="text-[clamp(24px,3vw,46px)] font-light italic leading-[0.92] tracking-[-0.05em]">AN ENTRANCE.</div>
        </div>

        <motion.div style={{ x: modelX, scale: modelScale, rotate, opacity: modelOpacity }} className="absolute left-1/2 top-1/2 z-20 h-[70svh] w-[45vw] min-w-[280px] max-w-[560px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-[10%] rounded-full bg-black/[0.05] blur-3xl" />
          <img src="/hero/model-1.webp" alt="Featured 3D fashion model" className="relative h-full w-full object-contain drop-shadow-[0_32px_50px_rgba(0,0,0,0.16)]" />
        </motion.div>

        <ParallaxCardCluster progress={smooth} />

        <div className="absolute bottom-7 left-6 right-6 z-30 flex items-end justify-between md:left-12 md:right-12">
          <div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-black/45">Scroll to explore</div>
            <div className="mt-2 h-px w-32 bg-black/10"><motion.div style={{ scaleX: smooth }} className="h-full origin-left bg-black" /></div>
          </div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-black/45">01 — 04</div>
        </div>
      </div>
    </div>
  );
}

function ParallaxCardCluster({ progress }: { progress: ReturnType<typeof useMotionValue<number>> }) {
  return (
    <>
      {heroProducts.map((product, index) => {
        const anchor = index / Math.max(heroProducts.length - 1, 1);
        const left = useTransform(progress, [Math.max(anchor - 0.17, 0), anchor, Math.min(anchor + 0.17, 1)], [index % 2 ? 58 : 42, 50, index % 2 ? 42 : 58]);
        const y = useTransform(progress, [Math.max(anchor - 0.17, 0), anchor, Math.min(anchor + 0.17, 1)], [110, 0, -90]);
        const scale = useTransform(progress, [Math.max(anchor - 0.17, 0), anchor, Math.min(anchor + 0.17, 1)], [0.78, 1, 0.82]);
        const opacity = useTransform(progress, [Math.max(anchor - 0.17, 0), Math.max(anchor - 0.06, 0), Math.min(anchor + 0.08, 1), Math.min(anchor + 0.17, 1)], [0, 1, 1, 0]);
        return (
          <motion.div key={product.id} style={{ left: `${0}%`, x: useTransform(left, (value) => `${value - 50}vw`), y, scale, opacity }} className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[118px] rounded-[18px] border border-black/10 bg-white/65 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.09)] backdrop-blur-md sm:w-[150px] md:w-[170px]">
              <div className="aspect-[3/4] overflow-hidden rounded-[13px] bg-black/[0.025]"><img src={`/hero/card-${index + 1}.webp`} alt="" className="h-full w-full object-cover" /></div>
              <div className="px-1 pb-1 pt-2"><p className="text-[8px] uppercase tracking-[0.17em] text-black/45">{product.category}</p><p className="mt-1 text-xs font-medium tracking-tight">{product.name}</p><p className="mt-0.5 text-[9px] text-black/45">₹{product.price.toLocaleString("en-IN")}</p></div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

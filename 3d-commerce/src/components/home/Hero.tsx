"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { IconArrowDown, IconArrowUpRight } from "@tabler/icons-react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

import { heroProducts } from "@/config/hero-products";
import { HeroProductStage } from "./HeroProductStage";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const modelScale = useTransform(scrollYProgress, [0, 0.65, 1], [1, 1.14, 1.3]);
  const modelY = useTransform(scrollYProgress, [0, 1], [0, -72]);
  const modelRotate = useTransform(scrollYProgress, [0, 0.72, 1], [0, -5, -12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 68]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.68, 1], [1, 1, 0]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.35, 0.72, 1], [0.08, 0.11, 0.04, 0]);

  const scrollToCollection = () => {
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (shouldReduceMotion) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" && window.scrollY < 20) {
        scrollToCollection();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shouldReduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden border-b border-border/50"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_68%_42%,rgba(139,92,246,0.19),transparent_30%),radial-gradient(circle_at_45%_60%,rgba(99,102,241,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_55%)]" />
      <motion.div aria-hidden="true" style={{ opacity: gridOpacity }} className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[52%] top-[34%] -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[120px]" />

      <Container className="relative min-h-[calc(100svh-5rem)] py-0">
        <motion.div style={shouldReduceMotion ? undefined : { y: modelY, scale: modelScale, rotateZ: modelRotate }} className="absolute inset-y-0 right-[-7%] z-10 flex w-[82vw] items-center justify-center lg:right-[-2%] lg:w-[66vw] xl:right-[0%] xl:w-[60vw]">
          <HeroProductStage modelPath={heroProducts[0]?.model} />
        </motion.div>

        <motion.div style={shouldReduceMotion ? undefined : { y: contentY, opacity: contentOpacity }} className="relative z-30 flex min-h-[calc(100svh-5rem)] max-w-[640px] items-center py-20 lg:max-w-[590px]">
          <div>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.28em] text-primary sm:text-xs"
            >
              <span className="h-px w-8 bg-primary/70" />
              Premium 3D marketplace
            </motion.div>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 26, filter: "blur(10px)" }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[720px] text-[3.35rem] font-semibold leading-[0.9] tracking-[-0.07em] text-foreground sm:text-6xl lg:text-[clamp(4.25rem,6.1vw,6.9rem)]"
            >
              Experience
              <span className="block text-muted-foreground/80">the third</span>
              <span className="block">dimension.</span>
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-[520px] text-sm leading-6 text-muted sm:text-base sm:leading-7"
            >
              Discover premium 3D assets built to be explored, visualized, and delivered for the web. Need something unique? Have it built around your exact vision.
            </motion.p>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button href="/shop" size="lg" className="group">
                Explore collection
                <IconArrowUpRight size={17} stroke={1.7} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              <Button href="/custom" variant="outline" size="lg">
                Build custom 3D
              </Button>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.62 }}
              className="mt-10 flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.2em] text-muted sm:text-[10px]"
            >
              <span className="h-px w-12 bg-border" />
              Drag the model · Scroll to transform
            </motion.div>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={scrollToCollection}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: [0, 5, 0] }}
          transition={shouldReduceMotion ? undefined : { opacity: { duration: 0.8, delay: 0.9 }, y: { duration: 1.7, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute bottom-7 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground sm:flex"
          aria-label="Scroll to collection"
        >
          Scroll to explore
          <IconArrowDown size={14} stroke={1.5} />
        </motion.button>

        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-28 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </Container>
    </section>
  );
}

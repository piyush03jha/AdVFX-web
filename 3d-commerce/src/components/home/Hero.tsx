"use client";

import { Container } from "@/components/ui/Container";
import { heroProducts } from "@/config/hero-products";
import { HeroContent } from "./HeroContent";
import { HeroProductStage } from "./HeroProductStage";

export function Hero() {
  const activeProduct = heroProducts[0];

  return (
    <section
      className="
        relative
        isolate
        min-h-[calc(100svh-5rem)]
        overflow-hidden
        bg-black
        text-white
      "
      aria-label="Featured 3D collection"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.09),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.10),transparent_42%)]"
      />

      <Container className="relative min-h-[calc(100svh-5rem)] py-0">
        <div className="absolute inset-0 z-10">
          <HeroProductStage
            products={heroProducts}
            activeIndex={0}
          />
        </div>

        <div
          className="
            absolute
            inset-x-0
            top-0
            z-20
            flex
            items-start
            justify-between
            gap-8
            px-0
            pt-8
            sm:pt-10
            lg:pt-12
          "
        >
          <div className="max-w-[330px]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 sm:text-[11px]">
              Premium digital fashion
            </p>
            <p className="mt-2 max-w-[300px] text-xs leading-5 text-white/60 sm:text-sm sm:leading-6">
              Designed for visual commerce, campaign imagery and cinematic product presentation.
            </p>
          </div>

          <div className="max-w-[520px] text-right">
            <h1 className="text-[clamp(2.6rem,5.6vw,5.8rem)] font-light uppercase leading-[0.9] tracking-[-0.055em] text-white">
              {activeProduct.name}
            </h1>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between pb-7">
          <div className="max-w-[420px]">
            <HeroContent product={activeProduct} />
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-[0.22em] text-white/35">
              Scroll to explore
            </p>
            <div className="mt-2 h-px w-28 bg-white/15" />
          </div>
        </div>
      </Container>
    </section>
  );
}

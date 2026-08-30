"use client";

import { Container } from "@/components/ui/Container";

import { heroProducts } from "@/config/hero-products";

import { HeroContent } from "./HeroContent";
import { HeroProductStage } from "./HeroProductStage";

export function Hero() {
  const activeProduct = heroProducts[0];

  return (
    <section
      className="relative isolate overflow-hidden pb-16 lg:min-h-[calc(100svh-5rem)] lg:pb-0"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_24%,rgba(139,92,246,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_48%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 left-1/2 top-20 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[110px] lg:right-[-12%] lg:left-auto lg:top-[18%] lg:h-[70%] lg:w-[58%] lg:translate-x-0 lg:bg-primary/[0.035] lg:blur-[120px]"
      />

      <Container className="relative py-0 lg:min-h-[calc(100svh-5rem)] lg:py-8 xl:py-10">
        <div className="relative lg:absolute lg:inset-x-0 lg:top-1/2 lg:-translate-y-1/2">
          <HeroProductStage products={heroProducts} />
        </div>

        <div className="relative z-30 mt-[330px] lg:mt-0 lg:flex lg:min-h-[calc(100svh-5rem)] lg:w-[46%] lg:items-end lg:pb-14 xl:pb-20">
          <HeroContent product={activeProduct} />
        </div>
      </Container>
    </section>
  );
}

import { Button } from "@/components/ui/Button";

import type { HeroProduct } from "@/config/hero-products";

interface HeroContentProps {
  product: HeroProduct;
}

export function HeroContent({ product }: HeroContentProps) {
  return (
    <div className="relative max-w-[580px]">
      <div className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-primary">
        Premium 3D Collection
      </div>

      <h1 className="max-w-[600px] text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[clamp(4rem,5.8vw,6.5rem)]">
        Explore 3D without limits.
      </h1>

      <p className="mt-6 max-w-[510px] text-base leading-7 text-muted sm:text-lg">
        Discover production-ready 3D assets built for games, product visualization,
        animation, and creative pipelines.
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/models">
          Explore Models
          <span className="ml-2">→</span>
        </Button>

        <Button href="/custom" variant="outline">
          Build Custom Pack
        </Button>
      </div>
    </div>
  );
}

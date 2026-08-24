import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

import type { Product } from "@/config/products";

import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductDetailsTabs } from "./ProductDetailsTabs";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { RelatedProducts } from "./RelatedProducts";

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({
  product,
  relatedProducts,
}: ProductDetailProps) {
  return (
    <main className="overflow-hidden">
      {/* =====================================================
          PRODUCT HERO
      ====================================================== */}

      <Section
        className="
          relative
          pt-24
          sm:pt-28
          lg:pt-32
        "
        glow
      >
        {/* Ambient background */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-20
            h-[520px]
            w-[520px]
            -translate-x-1/2
            rounded-full
            bg-primary/8
            blur-[140px]
          "
        />

        <Container>
          <ProductBreadcrumb
            category={product.category}
            productName={product.name}
          />

          {/* =================================================
              MAIN PRODUCT AREA
          ================================================= */}

          <div
            className="
              relative
              mt-7
              grid
              grid-cols-1
              gap-8
              lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]
              lg:gap-10
              xl:gap-14
            "
          >
            {/* =================================================
                LEFT — PRODUCT GALLERY
            ================================================= */}

            <div className="min-w-0">
              <ProductGallery product={product} />
            </div>

            {/* =================================================
                RIGHT — PRODUCT INFORMATION
            ================================================= */}

            <div
              className="
                min-w-0
                lg:sticky
                lg:top-28
                lg:self-start
              "
            >
              <ProductInfo product={product} />
            </div>
          </div>

          {/* =================================================
              BENEFIT STRIP
          ================================================= */}

          <div
            className="
              mt-8
              grid
              grid-cols-1
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              sm:grid-cols-3
            "
          >
            <Benefit
              number="01"
              title="Instant delivery"
              description="Download your files immediately after purchase."
            />

            <Benefit
              number="02"
              title="Production ready"
              description="Optimized GLB asset ready for modern 3D workflows."
            />

            <Benefit
              number="03"
              title="Secure licensing"
              description="Clear usage rights for your selected license."
            />
          </div>
        </Container>
      </Section>

      {/* =====================================================
          DESCRIPTION / SPECS / REVIEWS
      ====================================================== */}

      <Section
        className="
          pt-12
          sm:pt-16
          lg:pt-20
        "
      >
        <Container>
          <ProductDetailsTabs product={product} />

          {/* =================================================
              RELATED PRODUCTS
          ================================================= */}

          {relatedProducts.length > 0 && (
            <div
              className="
                mt-16
                sm:mt-20
              "
            >
              <RelatedProducts
                products={relatedProducts}
              />
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}

function Benefit({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        gap-4
        border-b
        border-white/[0.07]
        p-5
        last:border-b-0
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
        lg:p-6
      "
    >
      <span
        className="
          pt-0.5
          text-[9px]
          font-medium
          tracking-[0.18em]
          text-primary
        "
      >
        {number}
      </span>

      <div className="min-w-0">
        <h3
          className="
            text-xs
            font-medium
            uppercase
            tracking-[0.12em]
            text-foreground
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1.5
            max-w-sm
            text-xs
            leading-5
            text-muted
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}
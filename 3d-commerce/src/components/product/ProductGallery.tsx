"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMaximize,
  IconRotate,
} from "@tabler/icons-react";

import type { Product } from "@/config/products";
import { IconButton } from "@/components/ui/IconButton";

interface ProductGalleryProps {
  product: Product;
}

function ProductModel({ model }: { model: string }) {
  const { scene } = useGLTF(model);
  return <primitive object={scene} scale={1} />;
}

function ModelView({ model, name }: { model: string; name: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0.45, 4], fov: 42 }}
      dpr={[1, 1.35]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 5, 4]} intensity={2} />
      <directionalLight position={[-4, 2, -2]} intensity={1} />
      <ProductModel model={model} />
      <Environment preset="studio" />
      <OrbitControls enablePan={false} enableZoom minDistance={2} maxDistance={7} enableDamping dampingFactor={0.06} />
    </Canvas>
  );
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const media = [
    { type: "image" as const, src: product.image, label: "Preview" },
    { type: "model" as const, src: product.model, label: "3D View" },
    { type: "image" as const, src: product.image, label: "Detail 01" },
    { type: "image" as const, src: product.image, label: "Detail 02" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [modelRequested, setModelRequested] = useState(false);

  const active = media[activeIndex];

  useEffect(() => {
    if (active.type === "model") {
      setModelRequested(true);
    }
  }, [active.type]);

  const previous = () => {
    setActiveIndex((current) => (current - 1 + media.length) % media.length);
  };

  const next = () => {
    setActiveIndex((current) => (current + 1) % media.length);
  };

  const fullscreen = () => {
    const element = document.getElementById("product-gallery-stage");
    if (!element) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    element.requestFullscreen?.();
  };

  return (
    <div className="space-y-3">
      <div id="product-gallery-stage" className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-[#080808]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.12),transparent_55%)]" />

        {active.type === "image" ? (
          <img src={active.src} alt={`${product.name} ${active.label}`} className="relative z-10 h-full w-full object-contain p-6 sm:p-10 lg:p-12" />
        ) : modelRequested ? (
          <div className="relative z-10 h-full w-full">
            <ModelView model={product.model} name={product.name} />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-white/60 backdrop-blur-md">
              Interactive 3D
            </div>
          </div>
        ) : null}

        <div className="absolute right-4 top-4 z-20 flex gap-2">
          <IconButton label="Previous" size="sm" variant="default" onClick={previous} className="border-white/10 bg-black/40 text-white/80 backdrop-blur-md hover:bg-black/60 hover:text-white">
            <IconChevronLeft size={16} />
          </IconButton>
          <IconButton label="Next" size="sm" variant="default" onClick={next} className="border-white/10 bg-black/40 text-white/80 backdrop-blur-md hover:bg-black/60 hover:text-white">
            <IconChevronRight size={16} />
          </IconButton>
          <IconButton label="Fullscreen" size="sm" variant="default" onClick={fullscreen} className="border-white/10 bg-black/40 text-white/80 backdrop-blur-md hover:bg-black/60 hover:text-white">
            <IconMaximize size={15} />
          </IconButton>
        </div>

        {active.type === "model" && (
          <div className="absolute bottom-4 left-4 z-20 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-white/50 backdrop-blur-md">
            <IconRotate size={12} className="mr-1 inline-block" />
            Drag to rotate · scroll to zoom
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {media.map((item, index) => (
          <button
            key={`${item.label}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-[4/3] overflow-hidden rounded-xl border transition-all ${activeIndex === index ? "border-primary ring-1 ring-primary/40" : "border-border hover:border-primary/30"}`}
          >
            {item.type === "image" ? (
              <img src={item.src} alt="" className="h-full w-full object-cover" loading={index === 0 ? "eager" : "lazy"} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0c0c0c] text-[9px] uppercase tracking-[0.16em] text-muted">3D</div>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/45 px-2 py-1 text-left text-[8px] uppercase tracking-[0.12em] text-white/70 backdrop-blur-sm">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

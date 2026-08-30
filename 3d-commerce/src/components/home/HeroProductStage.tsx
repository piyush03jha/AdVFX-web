"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import type { HeroProduct } from "@/config/hero-products";
import {
  HERO_PARALLAX,
  HERO_PARALLAX_CARD_COUNT,
} from "@/config/hero-parallax";

interface HeroProductStageProps {
  products: HeroProduct[];
}

interface CardModelProps {
  product: HeroProduct;
  index: number;
  total: number;
  mobile: boolean;
}

function CardModel({ product, index, total, mobile }: CardModelProps) {
  const { scene } = useGLTF(product.model);
  const groupRef = useRef<THREE.Group>(null);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;

    clone.position.sub(center);
    clone.scale.setScalar(1.45 / maxAxis);

    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });

    return clone;
  }, [scene]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    const config = mobile ? HERO_PARALLAX.mobile : HERO_PARALLAX.desktop;
    const centered = index - (total - 1) / 2;
    const normalized = THREE.MathUtils.clamp(
      centered / ((total - 1) / 2),
      -1,
      1,
    );
    const abs = Math.abs(normalized);
    const wave = Math.sin(index * config.waveFrequency) * config.waveAmplitude;
    const depth = Math.cos(index * config.waveFrequency * 0.78) * config.depthAmplitude;

    const targetX = centered * 0.44;
    const targetY = wave * (1 - abs * 0.42) * 0.026;
    const targetZ = depth * 0.018 - abs * 0.6;

    const idleFloat = Math.sin(clock.getElapsedTime() * 0.55 + index * 0.55) * (mobile ? 0.018 : 0.03);

    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 7, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY + idleFloat, 7, delta);
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 7, delta);

    const yRotation = THREE.MathUtils.lerp(
      config.sideRotationY,
      config.centerRotationY,
      1 - abs,
    );
    const sideSign = normalized >= 0 ? -1 : 1;
    const zRotation = THREE.MathUtils.lerp(0.38, -0.38, (normalized + 1) / 2);

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      THREE.MathUtils.degToRad(yRotation * sideSign),
      7,
      delta,
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      zRotation + THREE.MathUtils.degToRad(wave * 0.045),
      7,
      delta,
    );
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[1.15, 1.5]} />
        <meshBasicMaterial transparent opacity={0.92} />
      </mesh>
      <primitive object={prepared} />
    </group>
  );
}

function ParallaxScene({ products }: { products: HeroProduct[] }) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const scrollProgress = useRef(0);
  const targetProgress = useRef(0);
  const mobileRef = useRef(false);

  useEffect(() => {
    mobileRef.current = window.innerWidth < 768;

    const updateViewport = () => {
      mobileRef.current = window.innerWidth < 768;
    };

    window.addEventListener("resize", updateViewport, { passive: true });
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const stage = heroRef.current;
      if (!stage) return;

      const rect = stage.getBoundingClientRect();
      const travel = Math.max(rect.height + window.innerHeight * 0.65, 1);
      targetProgress.current = THREE.MathUtils.clamp(
        (window.innerHeight * 0.5 - rect.top) / travel,
        0,
        1,
      );
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const mobile = mobileRef.current;
    const config = mobile ? HERO_PARALLAX.mobile : HERO_PARALLAX.desktop;
    scrollProgress.current = THREE.MathUtils.damp(
      scrollProgress.current,
      targetProgress.current,
      8,
      delta,
    );

    const progress = scrollProgress.current;
    const signed = progress * 2 - 1;
    const drift = signed * config.scrollDrift * 0.006;
    const lift = Math.sin(progress * Math.PI) * config.scrollAmplitude * 0.009;

    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, drift, 7, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, -lift, 7, delta);
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      THREE.MathUtils.degToRad(signed * config.scrollTilt),
      7,
      delta,
    );

    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      mobile ? 10.5 : 13,
      5,
      delta,
    );
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: HERO_PARALLAX_CARD_COUNT }, (_, index) => {
        const product = products[index % products.length];
        return (
          <Suspense key={`${product.id}-${index}`} fallback={null}>
            <CardModel
              product={product}
              index={index}
              total={HERO_PARALLAX_CARD_COUNT}
              mobile={mobileRef.current}
            />
          </Suspense>
        );
      })}
    </group>
  );
}

export function HeroProductStage({ products }: HeroProductStageProps) {
  if (!products.length) return null;

  return (
    <div
      ref={(node) => {
        if (node) {
          (node as HTMLDivElement & { __heroStage?: HTMLDivElement }).__heroStage = node;
        }
      }}
      className="relative h-[360px] w-full sm:h-[470px] lg:h-[min(68vh,720px)]"
    >
      <Canvas
        camera={{ position: [0, 0, 13], fov: 31 }}
        dpr={[1, 1.2]}
        frameloop="always"
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.7} />
        <directionalLight position={[4, 6, 8]} intensity={2.4} />
        <directionalLight position={[-5, 2, -3]} intensity={0.9} />
        <pointLight position={[0, 2, 6]} intensity={1.5} />
        <ParallaxScene products={products} />
      </Canvas>
    </div>
  );
}

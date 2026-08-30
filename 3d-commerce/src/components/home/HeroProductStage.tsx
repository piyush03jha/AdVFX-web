"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
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

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const config = mobile ? HERO_PARALLAX.mobile : HERO_PARALLAX.desktop;
    const centered = index - (total - 1) / 2;
    const normalized = THREE.MathUtils.clamp(centered / ((total - 1) / 2), -1, 1);
    const abs = Math.abs(normalized);
    const wave = Math.sin(index * config.waveFrequency) * config.waveAmplitude;
    const depth = Math.cos(index * config.waveFrequency * 0.78) * config.depthAmplitude;

    const targetX = centered * (config.cardWidth + config.gap) * 0.82;
    const targetY = wave * (1 - abs * 0.42);
    const targetZ = depth - abs * 34;

    const t = clock.getElapsedTime();
    const ambientFloat = Math.sin(t * 0.7 + index * 0.55) * (mobile ? 2.5 : 5);

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetX,
      5,
      1 / 60,
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY + ambientFloat,
      5,
      1 / 60,
    );
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetZ,
      5,
      1 / 60,
    );

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
      5,
      1 / 60,
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      zRotation + THREE.MathUtils.degToRad(wave * 0.045),
      5,
      1 / 60,
    );
  });

  return (
    <group ref={groupRef}>
      <group>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[1.15, 1.5]} />
          <meshBasicMaterial color="#121212" transparent opacity={0.92} />
        </mesh>
        <primitive object={prepared} />
      </group>
    </group>
  );
}

function CardFrame({ index, total, mobile }: { index: number; total: number; mobile: boolean }) {
  const config = mobile ? HERO_PARALLAX.mobile : HERO_PARALLAX.desktop;
  const angle = ((index - (total - 1) / 2) / ((total - 1) / 2)) * Math.PI;

  return (
    <group rotation={[0, 0, angle * 0.03]}>
      <Html
        center
        transform
        distanceFactor={10}
        style={{
          width: `${config.cardWidth}px`,
          height: `${config.cardHeight}px`,
          borderRadius: "18px",
          overflow: "hidden",
          background: "linear-gradient(150deg, rgba(255,255,255,.11), rgba(255,255,255,.025))",
          border: "1px solid rgba(255,255,255,.13)",
          boxShadow: "0 20px 60px rgba(0,0,0,.34)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ height: "100%", width: "100%" }} />
      </Html>
    </group>
  );
}

function ParallaxScene({ products }: { products: HeroProduct[] }) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const mobileRef = useRef(false);

  useEffect(() => {
    const update = () => {
      mobileRef.current = window.innerWidth < 768;
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      targetScrollRef.current = THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const mobile = mobileRef.current;
    const config = mobile ? HERO_PARALLAX.mobile : HERO_PARALLAX.desktop;
    scrollRef.current = THREE.MathUtils.damp(scrollRef.current, targetScrollRef.current, 7, delta);

    const scroll = scrollRef.current;
    const signed = scroll * 2 - 1;
    const drift = signed * config.scrollDrift;
    const waveLift = Math.sin(scroll * Math.PI * 2) * config.scrollAmplitude;

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      -waveLift,
      5,
      delta,
    );
    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      drift,
      5,
      delta,
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      THREE.MathUtils.degToRad(signed * config.scrollTilt),
      5,
      delta,
    );

    camera.position.z = THREE.MathUtils.damp(camera.position.z, mobile ? 9.6 : 12.5, 4, delta);
  });

  const count = HERO_PARALLAX_CARD_COUNT;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {Array.from({ length: count }, (_, index) => {
        const product = products[index % products.length];
        return (
          <Suspense key={`${product.id}-${index}`} fallback={null}>
            <CardModel
              product={product}
              index={index}
              total={count}
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
    <div className="relative h-[360px] w-full sm:h-[470px] lg:h-[min(68vh,720px)]">
      <Canvas
        camera={{ position: [0, 0, 12.5], fov: 31 }}
        dpr={[1, 1.2]}
        frameloop="always"
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.7} />
        <directionalLight position={[4, 6, 8]} intensity={2.4} />
        <directionalLight position={[-5, 2, -3]} intensity={0.9} />
        <pointLight position={[0, 2, 6]} intensity={1.5} color="#8b5cf6" />
        <ParallaxScene products={products} />
      </Canvas>
    </div>
  );
}

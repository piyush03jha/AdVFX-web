"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

import { HERO_MODEL_ROTATION_MS } from "@/config/hero-motion";
import type { HeroProduct } from "@/config/hero-products";

const INITIAL_ENTER_DURATION = 1.25;
const ENTER_DURATION = 0.85;
const EXIT_DURATION = 0.65;
const TOTAL_CYCLE = HERO_MODEL_ROTATION_MS / 1000;
const ROTATION_DURATION = Math.max(TOTAL_CYCLE - ENTER_DURATION, 3);
const MODEL_SIZE = 3.15;

const INITIAL_START_Y = -4.2;
const ENTER_START_X = 3.8;
const EXIT_END_X = -3.8;

type ModelMode = "initial" | "enter" | "exit";

interface HeroModelProps {
  path: string;
  mode: ModelMode;
}

function HeroModel({ path, mode }: HeroModelProps) {
  const { scene } = useLoader(GLTFLoader, path);
  const groupRef = useRef<THREE.Group>(null);
  const rotationRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const preparedModel = useMemo(() => {
    const model = scene.clone(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    model.position.sub(center);
    model.scale.setScalar(MODEL_SIZE / maxDimension);

    const materials: THREE.Material[] = [];
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.castShadow = false;
      object.receiveShadow = false;

      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) => {
          const cloned = material.clone();
          cloned.transparent = true;
          materials.push(cloned);
          return cloned;
        });
        return;
      }

      const cloned = object.material.clone();
      cloned.transparent = true;
      object.material = cloned;
      materials.push(cloned);
    });

    return { model, materials };
  }, [scene]);

  useEffect(() => {
    elapsedRef.current = 0;

    if (groupRef.current) {
      groupRef.current.position.set(
        mode === "initial" ? 0 : mode === "enter" ? ENTER_START_X : 0,
        mode === "initial" ? INITIAL_START_Y : -0.75,
        0,
      );
      groupRef.current.scale.setScalar(
        mode === "initial" || mode === "enter" ? 0.92 : 1,
      );
    }

    rotationRef.current?.rotation.set(0, 0, 0);

    preparedModel.materials.forEach((material) => {
      material.opacity = mode === "exit" ? 1 : 0;
    });
  }, [mode, preparedModel]);

  useFrame((_, delta) => {
    if (!groupRef.current || !rotationRef.current) return;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    if (mode === "initial") {
      const progress = Math.min(elapsed / INITIAL_ENTER_DURATION, 1);
      const eased = THREE.MathUtils.smootherstep(progress, 0, 1);

      groupRef.current.position.y = THREE.MathUtils.lerp(
        INITIAL_START_Y,
        -0.75,
        eased,
      );
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.92, 1, eased));

      const opacity = THREE.MathUtils.lerp(0, 1, eased);
      preparedModel.materials.forEach((material) => {
        material.opacity = opacity;
      });

      return;
    }

    if (mode === "enter") {
      const progress = Math.min(elapsed / ENTER_DURATION, 1);
      const eased = THREE.MathUtils.smootherstep(progress, 0, 1);

      groupRef.current.position.x = THREE.MathUtils.lerp(
        ENTER_START_X,
        0,
        eased,
      );
      groupRef.current.position.y = -0.75;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.92, 1, eased));

      const opacity = THREE.MathUtils.lerp(0, 1, eased);
      preparedModel.materials.forEach((material) => {
        material.opacity = opacity;
      });

      if (elapsed > ENTER_DURATION) {
        const rotationProgress = Math.min(
          (elapsed - ENTER_DURATION) / ROTATION_DURATION,
          1,
        );
        const rotationEase = THREE.MathUtils.smootherstep(
          rotationProgress,
          0,
          1,
        );
        rotationRef.current.rotation.y = rotationEase * Math.PI * 2;
      }

      return;
    }

    const progress = Math.min(elapsed / EXIT_DURATION, 1);
    const eased = THREE.MathUtils.smootherstep(progress, 0, 1);

    groupRef.current.position.set(
      THREE.MathUtils.lerp(0, EXIT_END_X, eased),
      -0.75,
      0,
    );
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.86, eased));

    const opacity = THREE.MathUtils.lerp(1, 0, eased);
    preparedModel.materials.forEach((material) => {
      material.opacity = opacity;
    });
  });

  return (
    <group ref={groupRef}>
      <group ref={rotationRef}>
        <primitive object={preparedModel.model} />
      </group>
    </group>
  );
}

function LoadingModel() {
  return (
    <mesh position={[0, -0.75, 0]}>
      <icosahedronGeometry args={[0.22, 2]} />
      <meshStandardMaterial
        color="#8b5cf6"
        emissive="#6d28d9"
        emissiveIntensity={1.2}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

interface ProductViewerProps {
  products: HeroProduct[];
  activeIndex: number;
}

export function ProductViewer({ products, activeIndex }: ProductViewerProps) {
  const currentIndexRef = useRef(activeIndex);
  const hasMountedRef = useRef(false);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === currentIndexRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setPreviousIndex(currentIndexRef.current);
    currentIndexRef.current = activeIndex;

    const timeout = window.setTimeout(() => setPreviousIndex(null), EXIT_DURATION * 1000);
    return () => window.clearTimeout(timeout);
  }, [activeIndex]);

  if (!products.length) return null;

  const activeProduct = products[activeIndex];
  const previousProduct = previousIndex !== null ? products[previousIndex] : null;
  const activeMode: ModelMode = hasMountedRef.current ? "enter" : "initial";

  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_55%_44%,rgba(139,92,246,0.12),transparent_36%),radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.08),transparent_42%)]"
      />

      <Canvas
        className="relative z-10"
        frameloop="always"
        camera={{ position: [0, 0.05, 9.8], fov: 34 }}
        dpr={[1, 1.2]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[5, 7, 5]} intensity={2.3} />
        <directionalLight position={[-4, 3, -3]} intensity={0.8} />
        <pointLight position={[-2, 1, 3]} intensity={1.5} distance={10} color="#8b5cf6" />
        <spotLight position={[2, 6, 4]} intensity={8} angle={0.45} penumbra={0.9} distance={20} color="#c4b5fd" />
        <Environment preset="studio" environmentIntensity={0.55} />

        {previousProduct && (
          <Suspense fallback={null}>
            <HeroModel
              key={`previous-${previousProduct.id}`}
              path={previousProduct.model}
              mode="exit"
            />
          </Suspense>
        )}

        <Suspense fallback={<LoadingModel />}>
          <HeroModel
            key={`active-${activeProduct.id}`}
            path={activeProduct.model}
            mode={activeMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

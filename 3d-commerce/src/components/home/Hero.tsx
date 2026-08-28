"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  IconArrowDown,
  IconArrowUpRight,
  IconRotate3D,
} from "@tabler/icons-react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { heroProducts } from "@/config/hero-products";

const MODEL_SIZE = 3.25;
const ROTATION_RANGE = Math.PI * 2.25;
const DEFAULT_CAMERA_Z = 9.6;
const MODEL_PATH = heroProducts[0]?.model;

type HeroModelProps = {
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

function HeroModel({ progress, reducedMotion }: HeroModelProps) {
  const { scene } = useLoader(GLTFLoader, MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const rotationRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, lastX: 0, offset: 0 });

  const preparedModel = useMemo(() => {
    const model = scene.clone(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    model.position.sub(center);
    model.scale.setScalar(MODEL_SIZE / maxDimension);

    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
      }
    });

    return model;
  }, [scene]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX / window.innerWidth - 0.5;
      mouseRef.current.y = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !rotationRef.current) return;

    const scrollProgress = reducedMotion
      ? 0
      : THREE.MathUtils.clamp(progress.get(), 0, 1);
    const mouseX = reducedMotion ? 0 : mouseRef.current.x;
    const mouseY = reducedMotion ? 0 : mouseRef.current.y;
    const dragOffset = reducedMotion ? 0 : dragRef.current.offset;

    const targetGroupX = mouseY * -0.18;
    const targetGroupZ = -mouseX * 0.08;
    const targetRotation =
      scrollProgress * ROTATION_RANGE + mouseX * 0.28 + dragOffset;
    const targetY = 0.12 - scrollProgress * 0.1;
    const targetScale = 1 + Math.sin(scrollProgress * Math.PI) * 0.05;

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetGroupX,
      5,
      delta,
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetGroupZ,
      5,
      delta,
    );

    rotationRef.current.rotation.y = THREE.MathUtils.damp(
      rotationRef.current.rotation.y,
      targetRotation,
      6,
      delta,
    );
    rotationRef.current.position.y = THREE.MathUtils.damp(
      rotationRef.current.position.y,
      targetY,
      5,
      delta,
    );

    const scale = THREE.MathUtils.damp(
      rotationRef.current.scale.x,
      targetScale,
      5,
      delta,
    );
    rotationRef.current.scale.setScalar(scale);
  });

  return (
    <group
      ref={groupRef}
      position={[0, -0.55, 0]}
      onPointerDown={(event) => {
        event.stopPropagation();
        dragRef.current.active = true;
        dragRef.current.lastX = event.clientX;
      }}
      onPointerMove={(event) => {
        if (!dragRef.current.active || reducedMotion) return;
        event.stopPropagation();
        const deltaX = event.clientX - dragRef.current.lastX;
        dragRef.current.lastX = event.clientX;
        dragRef.current.offset += deltaX * 0.008;
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        dragRef.current.active = false;
      }}
      onPointerLeave={() => {
        dragRef.current.active = false;
      }}
    >
      <group ref={rotationRef}>
        <primitive object={preparedModel} />
      </group>
    </group>
  );
}

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });
  const copyY = useTransform(smoothProgress, [0, 1], [0, 110]);
  const copyOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);
  const modelX = useTransform(smoothProgress, [0, 1], [0, 120]);
  const modelScale = useTransform(smoothProgress, [0, 1], [1, 0.84]);
  const gridOpacity = useTransform(
    smoothProgress,
    [0, 0.6, 1],
    [0.45, 0.22, 0],
  );
  const modelOpacity = useTransform(
    smoothProgress,
    [0, 0.82, 1],
    [1, 1, 0.5],
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[165svh] overflow-clip"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_65%_38%,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(124,58,237,0.08),transparent_30%)]"
        />

        <motion.div
          aria-hidden="true"
          style={{ opacity: gridOpacity }}
          className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]"
        />

        <Container className="relative h-full">
          <motion.div
            style={
              shouldReduceMotion
                ? undefined
                : { y: copyY, opacity: copyOpacity }
            }
            className="absolute left-0 top-[19%] z-30 max-w-[620px] lg:top-1/2 lg:-translate-y-1/2"
          >
            <motion.p
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 14 }
              }
              animate={
                shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.7 }}
              className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary sm:text-xs"
            >
              Premium 3D marketplace
            </motion.p>

            <motion.h1
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 24, filter: "blur(10px)" }
              }
              animate={
                shouldReduceMotion
                  ? undefined
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              transition={{
                duration: 0.9,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-4 max-w-[720px] text-[clamp(3.2rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-foreground"
            >
              Experience the third dimension.
            </motion.h1>

            <motion.p
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 18 }
              }
              animate={
                shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 max-w-[520px] text-sm leading-6 text-muted sm:text-lg sm:leading-8"
            >
              Explore premium 3D assets, interact with every detail, or turn
              your own idea into a custom model.
            </motion.p>

            <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
              <Button href="/shop" size="lg">
                Explore models
                <IconArrowUpRight size={17} stroke={1.8} />
              </Button>
              <Button href="/custom" size="lg" variant="outline">
                Build custom
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted sm:mt-10">
              <IconRotate3D size={15} stroke={1.5} />
              Drag to rotate · scroll to transform
            </div>
          </motion.div>

          <motion.div
            style={
              shouldReduceMotion
                ? undefined
                : { x: modelX, scale: modelScale, opacity: modelOpacity }
            }
            className="pointer-events-auto absolute left-1/2 top-[27%] z-10 h-[390px] w-[520px] -translate-x-1/2 cursor-grab touch-none sm:h-[520px] sm:w-[680px] lg:left-[68%] lg:top-1/2 lg:h-[760px] lg:w-[820px] lg:-translate-x-1/2 lg:-translate-y-1/2"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[18%] rounded-full bg-primary/[0.08] blur-[90px]"
            />

            {MODEL_PATH ? (
              <Canvas
                dpr={[1, 1.25]}
                camera={{ position: [0, 0.1, DEFAULT_CAMERA_Z], fov: 34 }}
                gl={{
                  alpha: true,
                  antialias: false,
                  powerPreference: "high-performance",
                }}
                onCreated={({ gl }) => {
                  gl.outputColorSpace = THREE.SRGBColorSpace;
                  gl.toneMapping = THREE.ACESFilmicToneMapping;
                  gl.toneMappingExposure = 1.05;
                }}
              >
                <ambientLight intensity={1.8} />
                <directionalLight position={[4, 6, 5]} intensity={2.5} />
                <directionalLight position={[-4, 2, -2]} intensity={0.9} />
                <pointLight
                  position={[-2, 1, 3]}
                  intensity={1.5}
                  color="#8b5cf6"
                />
                <Environment preset="studio" environmentIntensity={0.5} />
                <HeroModel
                  progress={smoothProgress}
                  reducedMotion={Boolean(shouldReduceMotion)}
                />
              </Canvas>
            ) : null}
          </motion.div>

          <div className="absolute bottom-8 left-0 right-0 z-30 flex items-end justify-between sm:bottom-10">
            <div className="text-[9px] uppercase tracking-[0.22em] text-muted sm:text-[10px]">
              <span className="text-foreground">01</span>
              <span className="mx-2 text-muted/40">/</span>
              Explore
            </div>

            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : { y: [0, 6, 0] }
              }
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-muted"
            >
              <IconArrowDown size={15} stroke={1.5} />
              Scroll
            </motion.div>

            <div className="hidden text-right text-[9px] uppercase tracking-[0.22em] text-muted sm:block">
              Interactive 3D
              <br />
              <span className="text-foreground">Web optimized</span>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

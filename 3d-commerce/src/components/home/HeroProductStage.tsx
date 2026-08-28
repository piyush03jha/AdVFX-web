"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface HeroProductStageProps {
  modelPath?: string;
}

function HeroScene({ modelPath }: HeroProductStageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rotationRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath ?? "");

  useEffect(() => {
    if (!modelRef.current) return;

    const model = scene.clone(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    model.position.sub(center);
    model.scale.setScalar(3.25 / maxDimension);

    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = false;
      object.receiveShadow = false;
    });

    modelRef.current.clear();
    modelRef.current.add(model);
  }, [scene]);

  useFrame((state, delta) => {
    if (!rotationRef.current || !groupRef.current) return;

    const targetX = state.pointer.y * 0.14;
    const targetY = state.pointer.x * 0.24;

    rotationRef.current.rotation.x = THREE.MathUtils.damp(
      rotationRef.current.rotation.x,
      targetX,
      3.4,
      delta,
    );

    rotationRef.current.rotation.y = THREE.MathUtils.damp(
      rotationRef.current.rotation.y,
      state.clock.elapsedTime * 0.12 + targetY,
      1.6,
      delta,
    );

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      state.pointer.x * 0.17,
      2.8,
      delta,
    );

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      -0.38 + state.pointer.y * 0.08,
      2.8,
      delta,
    );
  });

  return (
    <Float speed={0.7} rotationIntensity={0.035} floatIntensity={0.12}>
      <group ref={groupRef}>
        <group ref={rotationRef}>
          <group ref={modelRef} />
        </group>
      </group>
    </Float>
  );
}

export function HeroProductStage({ modelPath }: HeroProductStageProps) {
  if (!modelPath) return null;

  return (
    <div className="relative h-full w-full">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.13] blur-[90px]" />

      <Canvas
        className="relative z-10"
        frameloop="always"
        dpr={[1, 1.25]}
        camera={{ position: [0, 0.05, 9.2], fov: 31 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.35} />
        <directionalLight position={[5, 6, 6]} intensity={2.2} />
        <directionalLight position={[-4, 2, 1]} intensity={0.75} />
        <pointLight position={[-2, 1, 3]} intensity={1.2} color="#8b5cf6" distance={10} />
        <Environment preset="studio" environmentIntensity={0.48} />
        <HeroScene modelPath={modelPath} />
      </Canvas>
    </div>
  );
}

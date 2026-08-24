"use client";

import { Canvas } from "@react-three/fiber";

import {
  Bounds,
  Center,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

interface Product3DStageProps {
  model: string;
  name: string;
}

function ProductModel({
  model,
}: {
  model: string;
}) {
  const { scene } = useGLTF(model);

  return (
    <Center
      precise
      disableZ
    >
      <primitive
        object={scene}
        dispose={null}
      />
    </Center>
  );
}

export default function Product3DStage({
  model,
  name,
}: Product3DStageProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        frameloop="always"
        camera={{
          position: [0, 0, 4],
          fov: 38,
        }}
        dpr={[1, 1.35]}
        gl={{
          antialias: true,
          powerPreference:
            "high-performance",
          alpha: true,
        }}
        performance={{
          min: 0.5,
        }}
      >
        <color
          attach="background"
          args={["#08080a"]}
        />

        <ambientLight intensity={1.2} />

        <directionalLight
          position={[4, 6, 5]}
          intensity={2.2}
        />

        <directionalLight
          position={[-4, 2, -3]}
          intensity={1}
        />

        <Environment
          preset="studio"
          environmentIntensity={0.8}
        />

        <Bounds
          fit
          clip
          observe
          margin={1.25}
        >
          <ProductModel model={model} />
        </Bounds>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={1.5}
          maxDistance={6}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI - 0.15}
          target={[0, 0, 0]}
        />
      </Canvas>

      <span className="sr-only">
        Interactive 3D preview of {name}
      </span>
    </div>
  );
}
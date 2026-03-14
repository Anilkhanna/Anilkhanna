"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

function FloatingShape({
  position,
  geometry,
  color,
  speed,
  distort,
  scale,
}: {
  position: [number, number, number];
  geometry: "torus" | "icosahedron" | "octahedron" | "dodecahedron";
  color: string;
  speed: number;
  distort: number;
  scale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.3;
    meshRef.current.rotation.y += speed * 0.002;
  });

  const geometryMap = {
    torus: <torusGeometry args={[1, 0.4, 16, 32]} />,
    icosahedron: <icosahedronGeometry args={[1, 1]} />,
    octahedron: <octahedronGeometry args={[1, 0]} />,
    dodecahedron: <dodecahedronGeometry args={[1, 0]} />,
  };

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometryMap[geometry]}
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.25}
          wireframe
          distort={distort}
          speed={speed}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const shapes = [
    {
      position: [-5.5, 1.5, -2] as [number, number, number],
      geometry: "torus" as const,
      color: isDark ? "#5eead4" : "#0d9488",
      speed: 1.2,
      distort: 0.3,
      scale: 0.7,
    },
    {
      position: [3, -1.5, -3] as [number, number, number],
      geometry: "icosahedron" as const,
      color: isDark ? "#22d3ee" : "#0891b2",
      speed: 0.8,
      distort: 0.4,
      scale: 0.6,
    },
    {
      position: [0.5, 2.5, -4] as [number, number, number],
      geometry: "octahedron" as const,
      color: isDark ? "#2dd4bf" : "#14b8a6",
      speed: 1.5,
      distort: 0.2,
      scale: 0.5,
    },
    {
      position: [-2, -2.5, -2.5] as [number, number, number],
      geometry: "dodecahedron" as const,
      color: isDark ? "#a78bfa" : "#7c3aed",
      speed: 1,
      distort: 0.35,
      scale: 0.55,
    },
    {
      position: [2.5, 2, -3.5] as [number, number, number],
      geometry: "torus" as const,
      color: isDark ? "#5eead4" : "#0d9488",
      speed: 0.6,
      distort: 0.25,
      scale: 0.45,
    },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight
        position={[-10, -10, -10]}
        intensity={0.2}
        color={isDark ? "#5eead4" : "#0d9488"}
      />
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
    </>
  );
}

export function FloatingScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ pointerEvents: "none", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  );
}

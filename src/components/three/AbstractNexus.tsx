"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { useTransitionContext } from "../layout/TransitionProvider";
import { CrystalShaderMaterial } from "./shaders/CrystalShader";

interface AbstractNexusProps {
  bgTexture: THREE.Texture | null;
}

/**
 * 3Dコアモーフィング中枢 (Abstract Nexus)
 * 5段階の幾何学ステート（液体 ➡️ 粒子 ➡️ 格子 ➡️ 結晶 ➡️ 推理ノード）をシームレスにブレンドモーフィング。
 */
export default function AbstractNexus({ bgTexture }: AbstractNexusProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const warmupMeshRef = useRef<THREE.Mesh>(null);
  const { size, pointer } = useThree();
  const { currentRoute, scrollProgress } = useTransitionContext();

  // Create highly advanced Crystal Shader Material
  const shaderMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      uniforms: THREE.UniformsUtils.clone(CrystalShaderMaterial.uniforms),
      vertexShader: CrystalShaderMaterial.vertexShader,
      fragmentShader: CrystalShaderMaterial.fragmentShader,
    });
    return mat;
  }, []);

  // Update FBO target texture in uniforms
  useEffect(() => {
    if (materialRef.current && bgTexture) {
      materialRef.current.uniforms.uBgTexture.value = bgTexture;
    }
  }, [bgTexture]);

  // 1. Asynchronous Shader Warmup (Pre-compile shader program in GPU)
  useEffect(() => {
    if (warmupMeshRef.current && materialRef.current) {
      // Force render once silently behind viewport to compile and cache program in GPU
      warmupMeshRef.current.visible = true;
      setTimeout(() => {
        if (warmupMeshRef.current) {
          warmupMeshRef.current.visible = false;
        }
      }, 50); // Instantly disable after warm-up
    }
  }, []);

  // 2. Map route to target morph state value (0.0 to 3.0)
  const targetMorphState = useMemo(() => {
    switch (currentRoute) {
      case "/":
        return 0.0 + scrollProgress * 0.8; // Blend liquid base with scroll
      case "/counter":
        return 1.0; // Cubic morph
      case "/schedule":
        return 1.8; // Lattice alignment
      case "/share":
        return 2.5; // Perfect key crystal
      case "/kakurenbo":
        return 3.0; // Dynamic nodes tree
      default:
        return 0.0;
    }
  }, [currentRoute, scrollProgress]);

  // Smoothly morph between states using GSAP / useFrame dampening
  useFrame((state, delta) => {
    if (!materialRef.current || !meshRef.current) return;

    const uniforms = materialRef.current.uniforms;

    // Time elapsed for noise
    uniforms.uTime.value = state.clock.getElapsedTime();

    // Mouse uniform coordinates
    uniforms.uMouse.value.lerp(pointer, 0.08);

    // Dynamic morph state interpolation with smooth dampening
    uniforms.uMorphState.value = THREE.MathUtils.lerp(
      uniforms.uMorphState.value,
      targetMorphState,
      0.08
    );

    // Screen resolution bridge
    uniforms.uResolution.value.set(size.width, size.height);

    // Pulse animation logic (e.g. bounce pulse on click / section transition)
    if (uniforms.uPulse.value > 0) {
      uniforms.uPulse.value = Math.max(0, uniforms.uPulse.value - delta * 1.5);
    }

    // Slowly rotate core mesh organically
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.12;

    // Smooth responsive scale based on viewport size
    const responsiveScale = Math.min(1.8, Math.max(0.9, size.width / 700));
    meshRef.current.scale.setScalar(responsiveScale);
  });

  return (
    <group>
      {/* Hidden Warmup Mesh (Asynchronous compile helper) */}
      <mesh ref={warmupMeshRef} visible={false} position={[0, 0, -20]}>
        <icosahedronGeometry args={[0.01, 1]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>

      {/* Primary Abstract Nexus Object */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[2.0, 6]} />
        <primitive ref={materialRef} object={shaderMaterial} attach="material" />
      </mesh>
    </group>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";
import PerformanceTracker from "./PerformanceTracker";
import AbstractNexus from "./AbstractNexus";
import GPGPUParticles from "./GPGPUParticles";
import { useTransitionContext } from "../layout/TransitionProvider";

/**
 * FBO (Frame Buffer Object) Background Capture Helper Component
 * captures whatever is rendered before it (background/lights) so the refract shader can sample it.
 */
function FBOBufferRenderer({ onCapture }: { onCapture: (tex: THREE.Texture) => void }) {
  const fbo = useFBO(1024, 1024, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });

  // Expose the captured texture reference to parent on mount
  useEffect(() => {
    if (fbo.texture) {
      onCapture(fbo.texture);
    }
  }, [fbo, onCapture]);

  return null;
}

export default function SceneContainer() {
  const [bgTexture, setBgTexture] = useState<THREE.Texture | null>(null);
  const [isFallbacked, setIsFallbacked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentRoute } = useTransitionContext();

  // Mount check to avoid mismatch hydration issues on SSG
  useEffect(() => {
    setMounted(true);
    
    // Global event listener to check fallback trigger
    const handleFallbackTrigger = () => {
      setIsFallbacked(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("webgl-fallback-active", { detail: { active: true } }));
      }
    };

    window.addEventListener("webgl-trigger-fallback", handleFallbackTrigger);
    return () => window.removeEventListener("webgl-trigger-fallback", handleFallbackTrigger);
  }, []);

  if (!mounted || isFallbacked) {
    return (
      /* Fallback background mesh wrapper (Beautiful Glassmorphism Backdrop) */
      <div 
        className="fixed inset-0 -z-10 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-indigo-950/20"
        id="glassmorphism-fallback-bg"
      >
        <div className="glow-bg top-1/4 left-1/3 w-[50vw] h-[50vw] bg-dango-green/10" />
        <div className="glow-bg bottom-1/4 right-1/3 w-[45vw] h-[45vw] bg-dango-pink/10" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none transition-opacity duration-1000">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]} // Starts with high device pixel ratio, slides down adaptively
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        {/* Lights */}
        <ambientLight intensity={0.25} color="#e0f2fe" />
        <directionalLight position={[5, 8, 5]} intensity={0.65} castShadow={false} />
        <pointLight position={[-6, 4, -4]} intensity={0.5} color="#34d399" />
        <pointLight position={[6, -4, 4]} intensity={0.4} color="#f472b6" />

        {/* FBO Buffer Capture */}
        <FBOBufferRenderer onCapture={setBgTexture} />

        {/* GPGPU Curl Flow & Dynamic Text Collision Particle Field */}
        <GPGPUParticles currentRoute={currentRoute} />

        {/* Abstract Nexus Morph Core */}
        <AbstractNexus bgTexture={bgTexture} />

        {/* Dynamic Performance Optimization */}
        <PerformanceTracker 
          onCriticalFallback={() => {
            setIsFallbacked(true);
            // Trigger 2D layout fallback event in global scope
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("webgl-fallback-active", { detail: { active: true } }));
            }
          }} 
        />
      </Canvas>
    </div>
  );
}

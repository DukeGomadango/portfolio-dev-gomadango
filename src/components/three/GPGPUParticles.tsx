"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { simplexNoiseGLSL } from "./shaders/CrystalShader";

interface GPGPUParticlesProps {
  currentRoute: string;
}

/**
 * GPU上で Curl Noise & HTMLテキストコリジョンをリアルタイム計算する GPGPU パーティクル中枢
 */
export default function GPGPUParticles({ currentRoute }: GPGPUParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  const [collisionRects, setCollisionRects] = useState<THREE.Vector4[]>([]);

  // Count of particles (Ultra-dense on desktop, responsive on mobile)
  const count = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return 6000;
    }
    return 15000;
  }, []);

  // 1. Kinetic Text Bridge: Calculate HTML text coordinate boundaries
  useEffect(() => {
    if (typeof window === "undefined") return;

    const calculateCollisionBounds = () => {
      // Find all target kinetic elements on the active page
      const elements = document.querySelectorAll("[data-kinetic-collision]");
      const rects: THREE.Vector4[] = [];

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Convert to normalized coordinates (-1 to 1) for the GPU
        const xMin = (rect.left / window.innerWidth) * 2.0 - 1.0;
        const xMax = (rect.right / window.innerWidth) * 2.0 - 1.0;
        const yMin = -(rect.bottom / window.innerHeight) * 2.0 + 1.0;
        const yMax = -(rect.top / window.innerHeight) * 2.0 + 1.0;

        rects.push(new THREE.Vector4(xMin, xMax, yMin, yMax));
      });

      // Pad array to ensure stable uniform sizing (supports up to 6 bounding boxes)
      while (rects.length < 6) {
        rects.push(new THREE.Vector4(999.0, 999.0, 999.0, 999.0)); // Offscreen padding
      }

      setCollisionRects(rects);
    };

    // Recalculate on scroll, resize, or path change
    calculateCollisionBounds();
    window.addEventListener("scroll", calculateCollisionBounds, { passive: true });
    window.addEventListener("resize", calculateCollisionBounds);

    // Timeout trigger to catch late DOM additions
    const timer = setTimeout(calculateCollisionBounds, 1000);

    return () => {
      window.removeEventListener("scroll", calculateCollisionBounds);
      window.removeEventListener("resize", calculateCollisionBounds);
      clearTimeout(timer);
    };
  }, [currentRoute]);

  // 2. Setup pure custom attributes on the GPU
  const [positions, randoms, sizes] = useMemo(() => {
    const posArr = new Float32Array(count * 3);
    const randArr = new Float32Array(count * 3);
    const sizeArr = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Uniform spherical initial distribution
      const theta = Math.random() * Math.PI * 2.0;
      const phi = Math.acos(Math.random() * 2.0 - 1.0);
      const r = 2.0 + Math.random() * 1.5;

      posArr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      posArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArr[i * 3 + 2] = r * Math.cos(phi);

      // Unique turbulence frequencies
      randArr[i * 3] = Math.random() * 2.0 - 1.0;
      randArr[i * 3 + 1] = Math.random() * 2.0 - 1.0;
      randArr[i * 3 + 2] = Math.random() * 0.8 + 0.2; // Phase offsets

      // Particle size variations
      sizeArr[i] = 1.0 + Math.random() * 4.0;
    }

    return [posArr, randArr, sizeArr];
  }, [count]);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uSpeed: { value: 0.18 },
      uCollisionRects: { 
        value: Array(6).fill(null).map(() => new THREE.Vector4(999.0, 999.0, 999.0, 999.0)) 
      },
      uResolution: { value: new THREE.Vector2(800, 600) },
      uColor: { value: new THREE.Color("#34d399") },
      uScale: { value: 1.0 },
    };
  }, []);

  // Sync uniforms on render
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uCollisionRects.value = collisionRects;
    }
  }, [collisionRects]);

  // Handle color mutations based on active page route
  useEffect(() => {
    if (!materialRef.current) return;
    const colorMap: Record<string, string> = {
      "/": "#34d399",          // Green
      "/counter": "#34d399",   // Green (Counter)
      "/schedule": "#f472b6",  // Pink (Schedule)
      "/share": "#fbbf24",     // Yellow (Share)
      "/kakurenbo": "#a78bfa", // Purple (Kakurenbo)
    };
    const hex = colorMap[currentRoute] || "#34d399";
    gsap.to(materialRef.current.uniforms.uColor.value, {
      r: new THREE.Color(hex).r,
      g: new THREE.Color(hex).g,
      b: new THREE.Color(hex).b,
      duration: 0.8,
      ease: "power2.out",
    });
  }, [currentRoute]);

  useFrame((state, delta) => {
    if (!materialRef.current || !pointsRef.current) return;

    // Slowly rotate particle field
    pointsRef.current.rotation.y += delta * 0.05;

    // Sync uniforms
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);

    // Responsive scaling
    const responsiveScale = Math.min(1.0, size.width / 1100);
    materialRef.current.uniforms.uScale.value = responsiveScale;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[randoms, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uSpeed;
          uniform float uScale;
          uniform vec4 uCollisionRects[6];
          uniform vec2 uResolution;

          attribute vec3 aRandom;
          attribute float aSize;

          varying vec3 vPosition;
          varying float vAlpha;

          ${simplexNoiseGLSL}

          // Calculate standard Curl Noise dynamically in the vertex shader
          vec3 getCurlNoise(vec3 p) {
            float e = 0.08;
            float n1 = snoise(p + vec3(0.0, e, 0.0));
            float n2 = snoise(p - vec3(0.0, e, 0.0));
            float n3 = snoise(p + vec3(0.0, 0.0, e));
            float n4 = snoise(p - vec3(0.0, 0.0, e));
            float n5 = snoise(p + vec3(e, 0.0, 0.0));
            float n6 = snoise(p - vec3(e, 0.0, 0.0));

            float x = (n1 - n2) - (n3 - n4);
            float y = (n3 - n4) - (n5 - n6);
            float z = (n5 - n6) - (n1 - n2);

            return normalize(vec3(x, y, z));
          }

          void main() {
            vec3 pos = position;
            
            // Apply GPGPU Curl fluid flow
            vec3 flow = getCurlNoise(pos * 0.45 + uTime * uSpeed);
            pos += flow * aRandom.z * 1.5;

            // Project current pos into Normalized Device Coordinates (NDC) to check collision
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            vec4 projPosition = projectionMatrix * mvPosition;
            vec2 ndc = projPosition.xy / projPosition.w;

            // GPU Kinetic Text Bridge (Check against 6 collision boxes)
            vec2 collisionPush = vec2(0.0);
            for (int i = 0; i < 6; i++) {
              vec4 rect = uCollisionRects[i];
              if (ndc.x > rect.x && ndc.x < rect.y && ndc.y > rect.z && ndc.y < rect.w) {
                // Inside collision box -> calculate repulsion force away from center of the rect
                vec2 center = vec2((rect.x + rect.y) * 0.5, (rect.z + rect.w) * 0.5);
                vec2 dir = normalize(ndc - center);
                collisionPush += dir * 0.42;
              }
            }

            // Transform repulsion from NDC screen coordinates back to 3D positions
            pos.xy += collisionPush * uScale;

            vPosition = pos;
            vAlpha = aRandom.z * 0.65;

            vec4 finalMvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * finalMvPosition;
            
            // Scale particle sizing based on depth
            gl_PointSize = aSize * (350.0 / -finalMvPosition.z) * uScale;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vAlpha;

          void main() {
            // Smooth circular particles
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
            
            // Additive additive color glow
            gl_FragColor = vec4(uColor, alpha * 0.85);
          }
        `}
      />
    </points>
  );
}

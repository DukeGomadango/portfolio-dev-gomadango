"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";

interface PerformanceTrackerProps {
  onCriticalFallback: () => void;
}

/**
 * FPSをミリ秒単位でリアルタイム計測し、DPR（解像度）を動的制御するアワード級の最適化コントローラー
 */
export default function PerformanceTracker({ onCriticalFallback }: PerformanceTrackerProps) {
  const { setDpr } = useThree();
  const consecutiveLowFrames = useRef(0);
  const totalFrames = useRef(0);
  const frameTimes = useRef<number[]>([]);
  const lastTime = useRef(typeof window !== "undefined" ? window.performance.now() : 0);
  const [fps, setFps] = useState(60);

  // Monitor frame delta times
  useFrame(() => {
    if (typeof window === "undefined") return;
    const now = window.performance.now();
    const delta = now - lastTime.current;
    lastTime.current = now;

    // Standardize delta to FPS
    const currentFps = 1000 / Math.max(1, delta);
    
    // Accumulate for rolling average
    frameTimes.current.push(currentFps);
    if (frameTimes.current.length > 60) {
      frameTimes.current.shift();
    }

    totalFrames.current += 1;

    // Check low FPS every 10 frames to avoid micro-jitter reactions
    if (totalFrames.current % 10 === 0) {
      const avgFps = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
      setFps(Math.round(avgFps));

      if (avgFps < 30) {
        consecutiveLowFrames.current += 1;
        
        // 1. First trigger: Reduce DPR dynamically from high ratio (e.g. 2.0) to 1.0 or 0.75
        if (consecutiveLowFrames.current === 1) {
          setDpr(1.0);
        } else if (consecutiveLowFrames.current === 2) {
          setDpr(0.75);
        } 
        // 2. Critical Fallback Trigger: Low FPS remains for 3 checks -> Unmount and fallback to beautiful 2D Glassmorphism
        else if (consecutiveLowFrames.current >= 3) {
          onCriticalFallback();
        }
      } else {
        // Reset low frame counters if performance recovers
        consecutiveLowFrames.current = Math.max(0, consecutiveLowFrames.current - 1);
      }
    }
  });

  // Track global performance events to expose FPS metrics in TechSpecs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateMetrics = () => {
      window.dispatchEvent(
        new CustomEvent("webgl-performance-metrics", {
          detail: { fps, dpr: window.devicePixelRatio },
        })
      );
    };
    updateMetrics();
  }, [fps]);

  return null;
}

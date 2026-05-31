"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TransitionContextProps {
  currentRoute: string;
  isTransitioning: boolean;
  navigateTo: (href: string) => void;
  scrollProgress: number;
}

const TransitionContext = createContext<TransitionContextProps>({
  currentRoute: "/",
  isTransitioning: false,
  navigateTo: () => {},
  scrollProgress: 0,
});

export const useTransitionContext = () => useContext(TransitionContext);

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [currentRoute, setCurrentRoute] = useState(pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [, startTransition] = useTransition();

  // 1. Initialize Lenis Smooth Scroll & GSAP ScrollTrigger Bridge
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset scroll position on route load
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    // Synchronize Lenis scrolling with GSAP ScrollTrigger
    lenis.on("scroll", (e) => {
      ScrollTrigger.update();
      
      // Calculate active scroll progress percentage
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        setScrollProgress(e.scroll / maxScroll);
      }
    });

    // Custom ticker logic for Lenis
    const handleRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", handleRefresh);

    // Connect Lenis to requestAnimationFrame loop or GSAP ticker
    function update(time: number) {
      lenis.raf(time);
      requestAnimationFrame(update);
    }
    const frameId = requestAnimationFrame(update);

    // Refresh ScrollTrigger when layout shifts
    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
      cancelAnimationFrame(frameId);
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
    };
  }, [pathname]);

  // 2. Custom Awwwards-class Transition Trigger
  const navigateTo = (href: string) => {
    if (href === currentRoute || isTransitioning) return;

    setIsTransitioning(true);

    // Timeline for WebGL screen-fill transition (0.8s)
    const tl = gsap.timeline({
      onComplete: () => {
        // Trigger Next.js route transition
        startTransition(() => {
          router.push(href);
          setCurrentRoute(href);
          
          // Smooth fade-in of the next page content
          setTimeout(() => {
            setIsTransitioning(false);
          }, 400);
        });
      }
    });

    // Animate a full-screen transition overlay or contract/expand the 3D Nexus
    tl.to(".page-transition-overlay", {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  // Synchronize route changes directly
  useEffect(() => {
    setCurrentRoute(pathname);
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ currentRoute, isTransitioning, navigateTo, scrollProgress }}>
      {children}
      {/* Visual Overlay for Page Transition */}
      <div 
        className="page-transition-overlay pointer-events-none fixed inset-0 z-50 bg-neutral-950 opacity-0"
        style={{ mixBlendMode: "multiply" }}
      />
    </TransitionContext.Provider>
  );
}

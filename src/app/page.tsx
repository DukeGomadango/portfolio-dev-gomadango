"use client";

import React, { useEffect, useState } from "react";
import Navigation from "@/components/layout/Navigation";
import TechSpecs from "@/components/ui/TechSpecs";
import { triggerLinkHoverSound, triggerLinkClickSound } from "@/components/ui/AudioController";
import { useTransitionContext } from "@/components/layout/TransitionProvider";
import { ArrowRight, Sparkles, Code2, Globe2 } from "lucide-react";

export default function Home() {
  const { navigateTo } = useTransitionContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCTA = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    triggerLinkClickSound();
    navigateTo(href);
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 w-full min-h-screen bg-transparent flex flex-col justify-between">
      {/* Premium Navigation Header */}
      <Navigation />

      {/* Main hero segment */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col justify-center items-start pt-32 pb-16 relative">
        {/* Glow ambient layer */}
        <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] glow-bg bg-dango-green/5" />

        {/* Section Tag */}
        <div className="flex items-center gap-2 mb-6 px-4 py-1.5 glass-panel select-none">
          <Sparkles className="w-4 h-4 text-dango-green animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-300">
            METAVERSE HUB PORTAL
          </span>
        </div>

        {/* Kinetic Title (Particles bounce off this heading!) */}
        <h1 
          className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08] select-none"
          data-kinetic-collision="true"
        >
          DANGO <br />
          <span className="bg-gradient-to-r from-dango-green via-emerald-400 to-teal-300 bg-clip-text text-transparent">
            STREAMVERSE
          </span>
        </h1>

        <p 
          className="max-w-xl text-lg text-neutral-400 leading-relaxed font-sans mb-10 select-none"
          data-kinetic-collision="true"
        >
          だんご Streamverse は、配信活動とクリエイター活動をスマートに拡張する、高度に最適化された自作プロダクト群の統合メタバースです。
          WebGL、パスキー認証、リアルタイムOCR等の最前線のフロントエンド工学を結集しています。
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap gap-4 mb-16 pointer-events-auto">
          <a
            href="/counter"
            onClick={(e) => handleCTA(e, "/counter")}
            onMouseEnter={triggerLinkHoverSound}
            className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-neutral-950 font-display font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(52,211,153,0.35)] cursor-pointer"
          >
            Explore Ecosystem
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/DukeGomadango/portfolio-dev-gomadango"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={triggerLinkHoverSound}
            onClick={triggerLinkClickSound}
            className="flex items-center gap-2 px-6 py-4 rounded-full glass-panel glass-card-hover font-display font-medium text-white transition-all cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-neutral-400" />
            Repository
          </a>
        </div>
      </main>

      {/* Footer Specs dashboard */}
      <footer className="w-full max-w-5xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pointer-events-none">
        {/* Dynamic Spec Dashboard */}
        <TechSpecs />

        <div className="flex flex-col items-center md:items-end gap-1.5 select-none font-mono text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
          <span>DESIGNED BY DUKEGOMADANGO</span>
          <span>© {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </div>
  );
}

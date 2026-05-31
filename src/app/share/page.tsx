"use client";

import React, { useEffect, useState } from "react";
import Navigation from "@/components/layout/Navigation";
import TechSpecs from "@/components/ui/TechSpecs";
import { triggerLinkHoverSound, triggerLinkClickSound } from "@/components/ui/AudioController";
import { useTransitionContext } from "@/components/layout/TransitionProvider";
import { Sparkles, ArrowLeft, KeyRound, HardDrive, Database } from "lucide-react";

export default function SharePage() {
  const { navigateTo } = useTransitionContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerLinkClickSound();
    navigateTo("/");
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 w-full min-h-screen bg-transparent flex flex-col justify-between">
      <Navigation />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col justify-center items-start pt-32 pb-16 relative">
        {/* Glow ambient layer */}
        <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] glow-bg bg-dango-yellow/5" />

        {/* Back Link */}
        <a
          href="/"
          onClick={handleBack}
          onMouseEnter={triggerLinkHoverSound}
          className="flex items-center gap-2 mb-8 text-xs font-mono text-neutral-400 hover:text-white transition-colors duration-300 pointer-events-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO PORTAL
        </a>

        {/* Section Tag */}
        <div className="flex items-center gap-2 mb-6 px-4 py-1.5 glass-panel select-none border-dango-yellow/20">
          <Sparkles className="w-4 h-4 text-dango-yellow animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-300">
            CASE STUDY 03 / CRYPTO DATA TRANSFER
          </span>
        </div>

        {/* Title */}
        <h1 
          className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight select-none"
          data-kinetic-collision="true"
        >
          DANGO <span className="text-dango-yellow">SHARE LINK</span>
        </h1>

        <p 
          className="max-w-xl text-md text-neutral-400 leading-relaxed font-sans mb-10 select-none"
          data-kinetic-collision="true"
        >
          パスキーによる厳格な本人確認のもと、配信特典を一人ひとりに安全に配布する高信頼ファイル配布プラットフォーム。
          硬質にきらめく3D「結晶鍵（Crystal Key）」は、このツールが担保する「絶対的な信頼性とセキュリティ」を表現しています。
        </p>

        {/* Technical Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 pointer-events-auto">
          {/* Feature 1 */}
          <div className="glass-panel glass-card-hover p-6 select-none border-white/5">
            <KeyRound className="w-6 h-6 text-dango-yellow mb-4" />
            <h3 className="font-display font-semibold text-white text-base mb-2">WebAuthn Passkeys</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              `@simplewebauthn` を統合。パスワードを排除し、生体認証（指紋・顔認証）を用いたセキュアな受取人特定スキームを確立。
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel glass-card-hover p-6 select-none border-white/5">
            <HardDrive className="w-6 h-6 text-dango-yellow mb-4" />
            <h3 className="font-display font-semibold text-white text-base mb-2">S3 Presigned URLs</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              AWS S3 SDKと直結。ファイルの直接公開を避け、期限付き署名（Presigned URL）による極めてセキュアな動的ファイルダウンロードを実現。
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel glass-card-hover p-6 select-none border-white/5">
            <Database className="w-6 h-6 text-dango-yellow mb-4" />
            <h3 className="font-display font-semibold text-white text-base mb-2">Drizzle ORM</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              PostgreSQLとの組み合わせによる、ダウンロード回数制限やワンタイムトークン発行の完全なトランザクション管理。
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pointer-events-none">
        <TechSpecs />
        <div className="flex flex-col items-center md:items-end gap-1.5 select-none font-mono text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
          <span>DANGO SHARE SPECS</span>
          <span>© {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </div>
  );
}

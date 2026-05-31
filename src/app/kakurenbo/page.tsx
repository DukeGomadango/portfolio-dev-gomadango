"use client";

import React, { useEffect, useState } from "react";
import Navigation from "@/components/layout/Navigation";
import TechSpecs from "@/components/ui/TechSpecs";
import { triggerLinkHoverSound, triggerLinkClickSound } from "@/components/ui/AudioController";
import { useTransitionContext } from "@/components/layout/TransitionProvider";
import { Sparkles, ArrowLeft, GitCommit, Users, Monitor } from "lucide-react";

export default function KakurenboPage() {
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
        <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] glow-bg bg-dango-purple/5" />

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
        <div className="flex items-center gap-2 mb-6 px-4 py-1.5 glass-panel select-none border-dango-purple/20">
          <Sparkles className="w-4 h-4 text-dango-purple animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-300">
            CASE STUDY 04 / INTERACTIVE DEDUCTION
          </span>
        </div>

        {/* Title */}
        <h1 
          className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight select-none"
          data-kinetic-collision="true"
        >
          DANGO <span className="text-dango-purple">KAKURENBO</span>
        </h1>

        <p 
          className="max-w-xl text-md text-neutral-400 leading-relaxed font-sans mb-10 select-none"
          data-kinetic-collision="true"
        >
          配信内の人気参加型ゲーム「かくれんぼ」における、リスナーの偽名・質問解答・本名をリアルタイムで整理し推理をサポートする支援ツール。
          3D「推理探索ノード（Deduction Nodes）」は、複雑な発言ログから真実へ収束していく思考プロセスを表しています。
        </p>

        {/* Technical Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 pointer-events-auto">
          {/* Feature 1 */}
          <div className="glass-panel glass-card-hover p-6 select-none border-white/5">
            <GitCommit className="w-6 h-6 text-dango-purple mb-4" />
            <h3 className="font-display font-semibold text-white text-base mb-2">@floating-ui/react</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              推理キャンバス上で、参加者の相関関係や発言履歴をポップオーバー・ツールチップでスマートにオーバーレイ表示。
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel glass-card-hover p-6 select-none border-white/5">
            <Users className="w-6 h-6 text-dango-purple mb-4" />
            <h3 className="font-display font-semibold text-white text-base mb-2">Sync Code System</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              複雑なアカウント登録を排除し、独自のハッシュ同期コードのみでPC端末間やスマホ間のデータを即時に移行・共有。
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel glass-card-hover p-6 select-none border-white/5">
            <Monitor className="w-6 h-6 text-dango-purple mb-4" />
            <h3 className="font-display font-semibold text-white text-base mb-2">Overlay Safe Mode</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              配信ツール（OBS等）に直接キャプチャしてリスナーに推理進行を公開しつつ、本名予想などの「機密情報」を隠せる配信モード。
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pointer-events-none">
        <TechSpecs />
        <div className="flex flex-col items-center md:items-end gap-1.5 select-none font-mono text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
          <span>DANGO KAKURENBO SPECS</span>
          <span>© {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </div>
  );
}

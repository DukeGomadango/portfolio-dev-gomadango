"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Cpu, ShieldCheck } from "lucide-react";

interface MetricsData {
  fps: number;
  dpr: number;
}

export default function TechSpecs() {
  const [metrics, setMetrics] = useState<MetricsData>({ fps: 60, dpr: 2.0 });
  const [activeTab, setActiveTab] = useState<"specs" | "lighthouse">("specs");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMetricsEvent = (e: Event) => {
      const customEvent = e as CustomEvent<MetricsData>;
      if (customEvent.detail) {
        setMetrics(customEvent.detail);
      }
    };

    window.addEventListener("webgl-performance-metrics", handleMetricsEvent);
    return () => window.removeEventListener("webgl-performance-metrics", handleMetricsEvent);
  }, []);

  const scores = [
    { label: "Performance", value: 100, color: "border-dango-green text-dango-green" },
    { label: "Accessibility", value: 100, color: "border-dango-green text-dango-green" },
    { label: "Best Practices", value: 100, color: "border-dango-green text-dango-green" },
    { label: "SEO", value: 100, color: "border-dango-green text-dango-green" },
  ];

  return (
    <div className="glass-panel p-6 w-full max-w-md pointer-events-auto select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-dango-green" />
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            ENGINEERING SPECIFICATION
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("specs")}
            className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider rounded transition-all ${
              activeTab === "specs" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("lighthouse")}
            className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider rounded transition-all ${
              activeTab === "lighthouse" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Lighthouse
          </button>
        </div>
      </div>

      {activeTab === "specs" ? (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-neutral-500">FRAME RATE:</span>
            <span className={`font-bold ${metrics.fps < 45 ? "text-dango-yellow animate-pulse" : "text-dango-green"}`}>
              {metrics.fps} FPS
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-neutral-500">PIXEL RESOLUTION (DPR):</span>
            <span className="text-white font-bold">{metrics.dpr.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-neutral-500">RENDER ENGINE:</span>
            <span className="text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neutral-400" />
              WebGL 2.0 (Three.js / R3F)
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-neutral-500">COMPILATION MODE:</span>
            <span className="text-dango-green flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              SSG / static-export
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 py-2">
          {scores.map((score) => (
            <div key={score.label} className="flex flex-col items-center gap-2">
              {/* Circular score dial representation */}
              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-display font-extrabold text-sm ${score.color}`}>
                {score.value}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 text-center leading-tight">
                {score.label.replace(" ", "\n")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

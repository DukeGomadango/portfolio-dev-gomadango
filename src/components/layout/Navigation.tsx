"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransitionContext } from "./TransitionProvider";
import AudioController, { triggerLinkHoverSound, triggerLinkClickSound } from "../ui/AudioController";

const NAV_ITEMS = [
  { href: "/", label: "Portal" },
  { href: "/counter", label: "Counter" },
  { href: "/schedule", label: "Schedule" },
  { href: "/share", label: "Share" },
  { href: "/kakurenbo", label: "Kakurenbo" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { navigateTo } = useTransitionContext();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    triggerLinkClickSound();
    navigateTo(href);
  };

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-5xl px-6 flex items-center justify-between pointer-events-none">
      {/* Brand Logo */}
      <div 
        className="glass-panel px-5 py-2.5 flex items-center gap-3 pointer-events-auto cursor-pointer"
        onMouseEnter={triggerLinkHoverSound}
        onClick={(e) => {
          triggerLinkClickSound();
          navigateTo("/");
        }}
      >
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-dango-green via-dango-pink to-dango-yellow animate-pulse" />
        <span className="font-display text-sm font-bold tracking-wider text-white">
          DANGO STREAMVERSE
        </span>
      </div>

      {/* Floating Menu */}
      <nav className="glass-panel px-2.5 py-1.5 flex items-center gap-1 pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              onMouseEnter={triggerLinkHoverSound}
              className={`px-4 py-2 text-xs font-display font-medium tracking-widest uppercase transition-all duration-300 rounded-full ${
                isActive 
                  ? "bg-white/10 text-white font-bold" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Global Sound Control Trigger */}
      <div className="pointer-events-auto">
        <AudioController />
      </div>
    </header>
  );
}

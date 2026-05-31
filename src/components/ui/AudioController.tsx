"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useSynthAudio } from "@/hooks/useSynthAudio";
import { useTransitionContext } from "../layout/TransitionProvider";

// Global Audio Engine Instance (Persists across client navigations)
let globalAudioEngine: ReturnType<typeof useSynthAudio> | null = null;

export default function AudioController() {
  const [muted, setMuted] = useState(true);
  const { currentRoute, scrollProgress } = useTransitionContext();

  // Lazily retrieve or create global audio engine instance on client
  const audioEngine = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!globalAudioEngine) {
      globalAudioEngine = useSynthAudio();
    }
    return globalAudioEngine;
  }, []);

  // Sync scroll progress and speed to filter cutoff frequency
  useEffect(() => {
    if (!audioEngine || muted) return;

    let lastScroll = typeof window !== "undefined" ? window.scrollY : 0;
    let speed = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      speed = Math.abs(currentScroll - lastScroll) * 0.05; // Scroll speed scaling factor
      lastScroll = currentScroll;

      // Update synth lowpass filter cutoff dynamically
      audioEngine.updateScrollFrequency(speed, scrollProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [audioEngine, muted, scrollProgress]);

  // Play rich morph swoosh sound effect on route changes
  useEffect(() => {
    if (!audioEngine || muted) return;
    audioEngine.playInteractionSound("morph");
  }, [currentRoute, audioEngine, muted]);

  // Handle manual Sound toggle
  const toggleSound = async () => {
    if (!audioEngine) return;

    if (muted) {
      // Respect user interactions, initialize/resume audio context
      await audioEngine.initializeAudio();
      audioEngine.setVolume(0.45); // Fade in to premium volume
      setMuted(false);
    } else {
      audioEngine.setVolume(0.0); // Mute instantly
      setMuted(true);
    }
  };

  // Expose hover effect sound trigger globally so navigation can trigger it
  useEffect(() => {
    if (typeof window === "undefined" || !audioEngine || muted) return;

    const handleHoverSound = () => {
      audioEngine.playInteractionSound("hover");
    };

    const handleClickSound = () => {
      audioEngine.playInteractionSound("click");
    };

    window.addEventListener("play-hover-sound", handleHoverSound);
    window.addEventListener("play-click-sound", handleClickSound);

    return () => {
      window.removeEventListener("play-hover-sound", handleHoverSound);
      window.removeEventListener("play-click-sound", handleClickSound);
    };
  }, [audioEngine, muted]);

  return (
    <button
      onClick={toggleSound}
      className="glass-panel glass-card-hover flex items-center justify-center p-3 text-neutral-400 hover:text-white pointer-events-auto cursor-pointer"
      style={{ zIndex: 99 }}
      aria-label={muted ? "Sound On" : "Sound Off"}
      id="sound-controller-toggle"
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-dango-green" />}
    </button>
  );
}

// Global hook or trigger to easily trigger hover sound from standard links
export const triggerLinkHoverSound = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("play-hover-sound"));
  }
};

export const triggerLinkClickSound = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("play-click-sound"));
  }
};

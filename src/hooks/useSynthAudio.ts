"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Web Audio APIを用いたジェネレーティブ・オーディオ ＆ インタラクティブ音響シンセエンジン
 */
export function useSynthAudio() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  
  // Synthesizer oscillators for generative ambient pad/drone
  const droneOsc1 = useRef<OscillatorNode | null>(null);
  const droneOsc2 = useRef<OscillatorNode | null>(null);
  const filterNode = useRef<BiquadFilterNode | null>(null);

  // Initialize Web Audio Engine (strictly on first interaction to respect autoplay policies)
  const initializeAudio = async () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 1. Create main master mixer
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.0, ctx.currentTime); // Starts muted, fades in
      mainGain.connect(ctx.destination);
      mainGainRef.current = mainGain;

      // 2. Create high-end lowpass filter for scroll synchronization
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime); // Low low-pass drone
      filter.Q.setValueAtTime(3.0, ctx.currentTime);
      filter.connect(mainGain);
      filterNode.current = filter;

      // 3. Create Generative Ambient Drone (Stereo Detuned Phased Pad)
      // Oscillator 1: Fundamental Root Note (A2 = 110Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(110.0, ctx.currentTime); // A2 fundamental
      
      const osc1Gain = ctx.createGain();
      osc1Gain.gain.setValueAtTime(0.35, ctx.currentTime);
      
      osc1.connect(osc1Gain);
      osc1Gain.connect(filter);
      droneOsc1.current = osc1;

      // Oscillator 2: Detuned Perfect Fifth (E3 = 164.81Hz)
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3 perfect fifth
      
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.25, ctx.currentTime);

      // Detune slightly to create slow organic phase shifts (Ambient wave)
      osc2.detune.setValueAtTime(15, ctx.currentTime); 
      
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      droneOsc2.current = osc2;

      // Start the generators
      osc1.start(0);
      osc2.start(0);

      // Smoothly fade in main mixer to 0.45
      mainGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 2.0);
      setIsAudioEnabled(true);
    } catch (err) {
      console.warn("Failed to initialize Web Audio Engine: ", err);
    }
  };

  // 4. Synthesize Click and Morph sound effects programmatically (0KB assets!)
  const playInteractionSound = (type: "hover" | "click" | "morph") => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;

    const ctx = audioCtxRef.current;
    
    // Create temporary nodes for the synth burst
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "hover") {
      // Extremely short, high frequency organic tick
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === "click") {
      // Perfect crystal resonance tone
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now); // D5 crystal frequency
      osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.25); // Slides down

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.31);
    } else if (type === "morph") {
      // Deep swoosh sweep
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.65); // Ascending harmonic shift

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.start(now);
      osc.stop(now + 0.71);
    }
  };

  // 5. Update filter cutoff frequency dynamically based on scroll speed / progress
  const updateScrollFrequency = (speed: number, progress: number) => {
    if (!filterNode.current || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    
    // Scale cutoff frequency between 400Hz (slow/idle) and 2400Hz (fast scroll)
    const targetFreq = Math.min(2400, 400 + speed * 1200 + progress * 500);
    
    filterNode.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.15);
  };

  // 6. Set Mute / Unmute state dynamically (Volume controller)
  const setVolume = (vol: number) => {
    if (!mainGainRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    mainGainRef.current.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.5);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return {
    isAudioEnabled,
    initializeAudio,
    playInteractionSound,
    updateScrollFrequency,
    setVolume,
  };
}

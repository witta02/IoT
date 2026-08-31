import React from 'react';
import type { SmartLightState } from '../types';
import { hapticEngine } from '../utils/haptics';

interface LightCardProps {
  state: SmartLightState;
  onToggle: () => void;
  onSelectMode?: (mode: number) => void;
  disabled: boolean;
}

export const LightCard: React.FC<LightCardProps> = ({ state, onToggle, onSelectMode, disabled }) => {
  const isLightOn = state.light;
  const modeLabels = ['ควบคุมเอง', 'ตามเวลา', 'ตามแสงสว่าง'];

  const handleToggle = () => {
    hapticEngine.playHaptic(!isLightOn);
    onToggle();
  };

  return (
    <section className="p-6 bg-[#0e1117]/80 backdrop-blur-xl border border-[#222834]/80 rounded-3xl shadow-2xl select-none flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:border-[#d4af37]/30">
      {/* Dynamic Background Ambiance Glow */}
      <div
        className={`absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none transition-opacity duration-1000 blur-[80px] ${
          isLightOn ? 'opacity-40 bg-[#d4af37]' : 'opacity-0'
        }`}
      />

      {/* Header Info Strip */}
      <div className="w-full flex items-center justify-between text-xs text-[#8b95a5] mb-3 z-10">
        <span className="flex items-center gap-2 font-medium">
          <span className={`w-2 h-2 rounded-full transition-all duration-500 ${
            isLightOn ? 'bg-[#d4af37] shadow-[0_0_10px_#d4af37]' : 'bg-zinc-700'
          }`} />
          <span className={isLightOn ? 'text-[#d4af37] font-semibold' : 'text-[#8b95a5]'}>
            {modeLabels[state.mode] || 'ควบคุมเอง'}
          </span>
        </span>
        {state.time && state.time !== '--:--:--' && (
          <span className="font-mono text-xs text-[#8b95a5] bg-[#141820] px-2 py-0.5 rounded-md border border-[#222834]">
            {state.time} น.
          </span>
        )}
      </div>

      {/* ─── ROUND LED BULB HERO ────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center my-2 z-10">
        {/* Dynamic Warm Golden Radiant Halo when ON */}
        {isLightOn && (
          <div
            className="absolute top-2 w-72 h-72 rounded-full pointer-events-none transition-opacity duration-700 blur-[64px]"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.45) 0%, rgba(212, 175, 55, 0.12) 50%, transparent 80%)'
            }}
          />
        )}

        {/* Clickable Round LED Light Bulb */}
        <button
          onClick={handleToggle}
          disabled={disabled}
          className="relative group p-1 rounded-2xl cursor-pointer disabled:opacity-40 select-none outline-none transition-transform duration-200 active:scale-95 z-10"
        >
          <svg viewBox="40 0 120 135" className="w-44 h-48 overflow-visible">
            <defs>
              <linearGradient id="gold-threads" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e180d" />
                <stop offset="25%" stopColor="#856427" />
                <stop offset="50%" stopColor="#3d2f13" />
                <stop offset="75%" stopColor="#a37c32" />
                <stop offset="100%" stopColor="#161208" />
              </linearGradient>

              <linearGradient id="obsidian-heatsink" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#12151b" />
                <stop offset="50%" stopColor="#252b37" />
                <stop offset="100%" stopColor="#0c0e12" />
              </linearGradient>

              <linearGradient id="gold-collar" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78591c" />
                <stop offset="50%" stopColor="#e5be58" />
                <stop offset="100%" stopColor="#5c4314" />
              </linearGradient>

              <radialGradient id="gold-dome-on" cx="45%" cy="38%" r="60%">
                <stop offset="0%" stopColor="#fffdf0" stopOpacity="1" />
                <stop offset="25%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="55%" stopColor="#d4af37" stopOpacity="0.95" />
                <stop offset="85%" stopColor="#b45309" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.85" />
              </radialGradient>

              <radialGradient id="gold-dome-off" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#4a4233" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#292723" stopOpacity="0.6" />
                <stop offset="90%" stopColor="#1a1c22" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0f1116" stopOpacity="0.95" />
              </radialGradient>

              <filter id="gold-bulb-bloom" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur1" />
                <feGaussianBlur stdDeviation="2" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Brass Screw Base */}
            <path
              d="M 88 126 C 92 126, 108 126, 112 126 C 114 130, 112 133, 100 133 C 88 133, 86 130, 88 126 Z"
              fill="#2b2314"
            />
            <rect x="86" y="112" width="28" height="3" rx="1.5" fill="url(#gold-threads)" />
            <rect x="85" y="117" width="30" height="3" rx="1.5" fill="url(#gold-threads)" />
            <rect x="86" y="122" width="28" height="3" rx="1.5" fill="url(#gold-threads)" />

            {/* Heatsink Collar */}
            <path
              d="M 82 98 L 118 98 L 115 110 L 85 110 Z"
              fill="url(#obsidian-heatsink)"
              stroke="#222834"
              strokeWidth="0.8"
            />
            <rect x="80" y="95" width="40" height="3.5" rx="1" fill="url(#gold-collar)" />

            {/* Glass Bulb Dome */}
            <path
              d="M 100 12 C 65 12, 48 44, 60 76 C 68 94, 80 96, 82 96 L 118 96 C 120 96, 132 94, 140 76 C 152 44, 135 12, 100 12 Z"
              fill={isLightOn ? "url(#gold-dome-on)" : "url(#gold-dome-off)"}
              stroke={isLightOn ? "#d4af37" : "#3b362a"}
              strokeWidth={isLightOn ? "2.5" : "1.8"}
              filter={isLightOn ? "url(#gold-bulb-bloom)" : "none"}
              className="transition-all duration-500"
            />

            {/* Internal Filament & Core */}
            {isLightOn && (
              <g className="animate-pulse">
                <line x1="92" y1="95" x2="95" y2="58" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="108" y1="95" x2="105" y2="58" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <path
                  d="M 95 58 Q 100 50, 105 58"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  filter="url(#gold-bulb-bloom)"
                />
                <circle cx="100" cy="54" r="9" fill="#ffffff" opacity="0.9" filter="url(#gold-bulb-bloom)" />
              </g>
            )}

            {/* Glossy Specular Arc Reflections */}
            <path
              d="M 76 66 A 32 32 0 0 1 114 44"
              fill="none"
              stroke={isLightOn ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.2)"}
              strokeWidth="3.2"
              strokeLinecap="round"
              className="transition-colors duration-300"
            />
            <circle
              cx="74"
              cy="72"
              r="2.5"
              fill={isLightOn ? "#ffffff" : "rgba(255, 255, 255, 0.25)"}
            />
          </svg>
        </button>

        {/* State Headline */}
        <div className="mt-2 text-center flex items-center justify-center gap-3">
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2.5 ${
            isLightOn ? 'text-[#d4af37]' : 'text-zinc-500'
          }`}>
            <span>{isLightOn ? 'ไฟเปิดอยู่' : 'ไฟปิดอยู่'}</span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-mono uppercase font-bold border ${
              isLightOn
                ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              {isLightOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* ─── ARCHITECTURAL SMART WALL LIGHT SWITCH ───────────────────── */}
        <div className="mt-4 w-64 sm:w-72">
          <button
            onClick={handleToggle}
            disabled={disabled}
            className={`w-full h-16 rounded-2xl p-1.5 flex items-center justify-between cursor-pointer transition-all duration-300 disabled:opacity-40 select-none outline-none relative overflow-hidden border ${
              isLightOn
                ? 'bg-[#151922] border-[#d4af37]/50 shadow-[0_0_24px_rgba(212,175,55,0.25)]'
                : 'bg-[#0d0f14] border-[#222834] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
            }`}
          >
            {/* Rocker Switch Track & Paddle */}
            <div className="relative w-full h-full rounded-xl flex items-center justify-between px-4">
              {/* Left Label (OFF side) */}
              <span className={`text-xs font-mono font-bold transition-colors duration-300 ${
                !isLightOn ? 'text-zinc-300' : 'text-zinc-600'
              }`}>
                OFF
              </span>

              {/* Physical Rocker Switch Knob */}
              <div className={`absolute top-1 bottom-1 w-32 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                isLightOn
                  ? 'right-1 bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] shadow-[0_0_16px_rgba(212,175,55,0.5)]'
                  : 'left-1 bg-[#1c222d] border border-[#2b3444] text-[#8b95a5]'
              }`}>
                {/* Switch LED Indicator Slot */}
                <span className={`w-1.5 h-4 rounded-full transition-all duration-300 ${
                  isLightOn ? 'bg-[#07080a] shadow-inner' : 'bg-zinc-700'
                }`} />
                
                {/* Power Symbol & Action Text */}
                <span className="text-xs font-bold font-mono flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                    <path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0" strokeLinecap="round" />
                  </svg>
                  {isLightOn ? 'แตะเพื่อปิด' : 'แตะเพื่อเปิด'}
                </span>
              </div>

              {/* Right Label (ON side) */}
              <span className={`text-xs font-mono font-bold transition-colors duration-300 ${
                isLightOn ? 'text-[#d4af37]' : 'text-zinc-600'
              }`}>
                ON
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

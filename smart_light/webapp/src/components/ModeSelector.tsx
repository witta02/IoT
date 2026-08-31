import React from 'react';
import { hapticEngine } from '../utils/haptics';

interface ModeSelectorProps {
  currentMode: number;
  onSelectMode: (mode: number) => void;
  disabled: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  disabled
}) => {
  const safeMode = typeof currentMode === 'number' ? currentMode : 0;
  const modes = [
    { id: 0, label: 'ควบคุมเอง', desc: 'เปิด-ปิดผ่านแอป' },
    { id: 1, label: 'ตามเวลา', desc: 'เปิด-ปิดตามนาฬิกา' },
    { id: 2, label: 'ตามแสงสว่าง', desc: 'ปรับตามความมืด' }
  ];

  const handleModeChange = (id: number) => {
    if (id !== safeMode) {
      hapticEngine.playHaptic(false);
      onSelectMode(id);
    }
  };

  return (
    <section className="p-5 bg-[#0e1117]/80 backdrop-blur-xl border border-[#222834]/80 rounded-3xl shadow-xl select-none transition-all duration-300 hover:border-[#d4af37]/30">
      <div className="flex items-center justify-between mb-3 text-xs font-medium text-[#8b95a5]">
        <span className="flex items-center gap-1.5 font-semibold text-[#c5cedc]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          โหมดการทำงาน
        </span>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] font-semibold">
          {safeMode === 0 ? 'ควบคุมเอง' : safeMode === 1 ? 'ตามเวลา' : 'ตามแสงสว่าง'}
        </span>
      </div>

      {/* Machined Obsidian Segmented Bar with Gold Accents */}
      <div className="grid grid-cols-3 gap-2 bg-[#141820] p-1.5 rounded-2xl border border-[#222834] shadow-inner">
        {modes.map((mode) => {
          const isActive = safeMode === mode.id;
          return (
            <button
              key={mode.id}
              disabled={disabled}
              onClick={() => handleModeChange(mode.id)}
              className={`relative py-3 px-2 rounded-xl text-center transition-all duration-300 cursor-pointer disabled:opacity-40 select-none flex flex-col items-center justify-center ${
                isActive
                  ? 'bg-gradient-to-b from-[#1c222d] to-[#161a22] text-[#fcfbfa] shadow-lg border border-[#d4af37]/50'
                  : 'text-[#657184] hover:text-[#c5cedc] hover:bg-[#181d26]'
              }`}
            >
              {/* Active Indicator Top Gold Bar */}
              {isActive && (
                <div className="absolute -top-1 w-8 h-0.5 bg-[#d4af37] rounded-full shadow-[0_0_10px_#d4af37]" />
              )}

              <div className="flex items-center gap-1.5">
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />
                )}
                <span className={`text-xs font-semibold tracking-tight ${isActive ? 'text-[#fcfbfa]' : 'text-[#8b95a5]'}`}>
                  {mode.label}
                </span>
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${
                isActive ? 'text-[#d4af37] font-medium' : 'text-[#505a6a]'
              }`}>
                {mode.desc}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

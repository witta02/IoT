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
  const modes = [
    { id: 0, label: 'เปิด-ปิดเอง', desc: 'ควบคุมผ่านแอป' },
    { id: 1, label: 'ตั้งเวลา', desc: 'เปิด-ปิดตามเวลา' },
    { id: 2, label: 'ตรวจจับแสง', desc: 'อัตโนมัติตามแสง' }
  ];

  const handleModeChange = (id: number) => {
    if (id !== currentMode) {
      hapticEngine.playHaptic(false);
      onSelectMode(id);
    }
  };

  return (
    <section className="pb-8 mb-8 border-b border-[#222834] select-none">
      <div className="flex items-center justify-between mb-3 text-xs font-medium text-[#8b95a5]">
        <span>โหมดการทำงาน</span>
        <span className="text-[11px] text-[#d4af37] font-semibold">
          {currentMode === 0 ? 'ควบคุมเอง' : currentMode === 1 ? 'ตามเวลา' : 'ตามแสงสว่าง'}
        </span>
      </div>

      {/* Machined Obsidian Segmented Bar with Gold Accents */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#0e1117] p-1.5 rounded-2xl border border-[#222834] shadow-inner">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              disabled={disabled}
              onClick={() => handleModeChange(mode.id)}
              className={`relative py-3 px-2 rounded-xl text-center transition-all duration-200 cursor-pointer disabled:opacity-40 select-none flex flex-col items-center justify-center ${
                isActive
                  ? 'bg-[#181e28] text-[#fcfbfa] shadow-md border border-[#d4af37]/40'
                  : 'text-[#657184] hover:text-[#c5cedc] hover:bg-[#141820]'
              }`}
            >
              {/* Active Indicator Gold Top Notch */}
              {isActive && (
                <div className="absolute -top-1 w-6 h-0.5 bg-[#d4af37] rounded-full shadow-[0_0_8px_#d4af37]" />
              )}

              <div className="flex items-center gap-1.5">
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_4px_#d4af37]" />
                )}
                <span className={`text-xs font-semibold tracking-tight ${isActive ? 'text-[#fcfbfa]' : 'text-[#8b95a5]'}`}>
                  {mode.label}
                </span>
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${
                isActive ? 'text-[#d4af37]' : 'text-[#505a6a]'
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

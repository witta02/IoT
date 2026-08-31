import React, { useState, useEffect } from 'react';

interface LdrSensorCardProps {
  ldrValue: number;
  ldrThreshold: number;
  onUpdateThreshold: (threshold: number) => void;
  disabled: boolean;
}

export const LdrSensorCard: React.FC<LdrSensorCardProps> = ({
  ldrValue,
  ldrThreshold,
  onUpdateThreshold,
  disabled
}) => {
  const safeThreshold = Number(ldrThreshold) || 1500;
  const safeLdr = Number(ldrValue) || 0;
  const [sliderVal, setSliderVal] = useState(safeThreshold);

  useEffect(() => {
    setSliderVal(Number(ldrThreshold) || 1500);
  }, [ldrThreshold]);

  const percentBright = Math.min(100, Math.max(0, Math.round((safeLdr / 4095) * 100)));
  const isDark = safeLdr < sliderVal;

  const handlePresetThreshold = (val: number) => {
    setSliderVal(val);
    onUpdateThreshold(val);
  };

  return (
    <section className="p-6 bg-[#0e1117]/80 backdrop-blur-xl border border-[#222834]/80 rounded-3xl shadow-xl transition-all duration-300 hover:border-[#d4af37]/30 select-none flex flex-col items-center text-center">
      {/* Centered Header */}
      <div className="flex flex-col items-center mb-4 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            <h2 className="text-xs font-bold text-[#fcfbfa]">
              ตรวจจับความสว่างรอบห้อง
            </h2>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
            ระบบทำงานอยู่
          </span>
        </div>
        <p className="text-[11px] text-[#8b95a5] mt-1.5 text-left w-full">
          โคมไฟจะเปิดเมื่อห้องมืด และดับอัตโนมัติเมื่อห้องสว่าง
        </p>

        {/* Big Centered Lux Metric */}
        <div className="my-4 py-3 px-6 bg-[#141820] border border-[#222834] rounded-2xl w-full flex items-center justify-between">
          <div className="text-left">
            <span className="text-[11px] text-[#8b95a5] block font-medium">ระดับแสงปัจจุบัน</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#d4af37] shadow-[0_0_8px_#d4af37]' : 'bg-zinc-700'}`} />
              <span className="text-xs font-semibold text-[#fcfbfa]">
                {isDark ? 'สภาพมืด (เปิดไฟ)' : 'สภาพสว่าง (ปิดไฟ)'}
              </span>
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-[#d4af37] font-mono">
            {percentBright}%
          </div>
        </div>
      </div>

      {/* Visual Ambient Light Meter */}
      <div className="w-full mb-3 p-3.5 bg-[#141820] rounded-2xl border border-[#222834]">
        <div className="flex items-center justify-between text-[11px] text-[#8b95a5] mb-2 font-mono">
          <span>มิเตอร์วัดแสง</span>
          <span className="text-[#fcfbfa] font-bold">{percentBright}% / 100%</span>
        </div>

        <div className="relative w-full h-2.5 bg-[#0e1117] rounded-full overflow-hidden border border-[#232a38]">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#996515] via-[#d4af37] to-[#fef08a] shadow-[0_0_10px_rgba(212,175,55,0.4)]"
            style={{ width: `${percentBright}%` }}
          />
        </div>
      </div>

      {/* Sensitivity Threshold Slider & Presets */}
      <div className="w-full space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-[#8b95a5]">
          <span>ระดับความมืดที่ให้เปิดไฟ:</span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#141820] border border-[#222834] text-xs text-[#fcfbfa] font-medium">
            {sliderVal < 1000 ? 'ต้องมืดสนิท' : sliderVal < 2500 ? 'มืดปานกลาง' : 'มืดเล็กน้อยก็เปิด'}
          </span>
        </div>

        <div className="pt-1">
          <input
            type="range"
            min="100"
            max="3900"
            step="25"
            value={sliderVal}
            onChange={(e) => setSliderVal(Number(e.target.value))}
            onMouseUp={() => onUpdateThreshold(sliderVal)}
            onTouchEnd={() => onUpdateThreshold(sliderVal)}
            disabled={disabled}
            className="w-full cursor-pointer accent-[#d4af37]"
          />
        </div>

        {/* Quick Sensitivity Presets */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: 'มืดสนิท', val: 800 },
            { label: 'หัวค่ำ/สลัว', val: 1800 },
            { label: 'มืดเล็กน้อย', val: 2800 }
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => handlePresetThreshold(preset.val)}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all border cursor-pointer ${
                Math.abs(sliderVal - preset.val) < 300
                  ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#d4af37]'
                  : 'bg-[#141820] hover:bg-[#1c222d] border-[#222834] text-[#8b95a5]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

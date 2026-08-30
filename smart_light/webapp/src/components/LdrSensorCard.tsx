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
  const [sliderVal, setSliderVal] = useState(ldrThreshold);

  useEffect(() => {
    setSliderVal(ldrThreshold);
  }, [ldrThreshold]);

  const percentBright = Math.min(100, Math.max(0, Math.round((ldrValue / 4095) * 100)));
  const isDark = ldrValue < sliderVal;

  return (
    <section className="pb-8 mb-8 border-b border-[#222834] transition-all animate-fadeIn select-none flex flex-col items-center text-center">
      {/* Centered Header */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-2 justify-center">
          <h2 className="text-xs font-semibold text-[#fcfbfa]">
            ระบบตรวจจับความสว่างรอบห้อง
          </h2>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
            กำลังทำงาน
          </span>
        </div>
        <p className="text-[11px] text-[#8b95a5] mt-1">
          โคมไฟจะเปิดอัตโนมัติเมื่อห้องมืด และดับเมื่อห้องสว่าง
        </p>

        {/* Big Centered Lux Metric */}
        <div className="my-3">
          <div className="text-3xl font-black tracking-tight text-[#fcfbfa] font-mono">
            {percentBright}%
          </div>
          <div className="flex items-center gap-1.5 justify-center mt-1">
            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#d4af37] shadow-[0_0_6px_#d4af37]' : 'bg-zinc-700'}`} />
            <span className="text-xs font-medium text-[#c5cedc]">
              {isDark ? 'สภาพมืด (เปิดไฟ)' : 'สภาพสว่าง (ปิดไฟ)'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Ambient Light Meter */}
      <div className="w-full my-2 p-3.5 bg-[#0e1117] rounded-2xl border border-[#222834]">
        <div className="flex items-center justify-between text-[11px] text-[#8b95a5] mb-2 font-mono">
          <span>ระดับความสว่าง</span>
          <span className="text-[#fcfbfa] font-bold">{percentBright}% / 100%</span>
        </div>

        <div className="relative w-full h-2.5 bg-[#141820] rounded-full overflow-hidden border border-[#232a38]">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#996515] via-[#d4af37] to-[#fef08a] shadow-[0_0_10px_rgba(212,175,55,0.4)]"
            style={{ width: `${percentBright}%` }}
          />
        </div>
      </div>

      {/* Sensitivity Threshold Slider */}
      <div className="w-full space-y-2.5 pt-3">
        <div className="flex items-center justify-between text-xs text-[#8b95a5]">
          <span>ระดับความมืดที่ให้เปิดไฟ:</span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#0e1117] border border-[#222834] text-xs text-[#fcfbfa] font-medium">
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
            className="w-full"
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-[#505a6a]">
          <span>มืดสนิท (0%)</span>
          <span>มืดปานกลาง (50%)</span>
          <span>สว่าง (100%)</span>
        </div>
      </div>
    </section>
  );
};

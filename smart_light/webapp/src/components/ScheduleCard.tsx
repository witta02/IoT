import React, { useState, useEffect } from 'react';

interface ScheduleCardProps {
  onHour: number;
  onMin: number;
  offHour: number;
  offMin: number;
  onSaveSchedule: (onH: number, onM: number, offH: number, offM: number) => void;
  disabled: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  onHour,
  onMin,
  offHour,
  offMin,
  onSaveSchedule,
  disabled
}) => {
  const [onH, setOnH] = useState(onHour);
  const [onM, setOnM] = useState(onMin);
  const [offH, setOffH] = useState(offHour);
  const [offM, setOffM] = useState(offMin);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setOnH(onHour);
    setOnM(onMin);
    setOffH(offHour);
    setOffM(offMin);
  }, [onHour, onMin, offHour, offMin]);

  const handleSave = () => {
    onSaveSchedule(onH, onM, offH, offM);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyPreset = (presetOnH: number, presetOnM: number, presetOffH: number, presetOffM: number) => {
    setOnH(presetOnH);
    setOnM(presetOnM);
    setOffH(presetOffH);
    setOffM(presetOffM);
    onSaveSchedule(presetOnH, presetOnM, presetOffH, presetOffM);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const format2 = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="pb-8 mb-8 border-b border-[#222834] transition-all animate-fadeIn select-none flex flex-col items-center text-center">
      {/* Centered Header */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-2 justify-center">
          <h2 className="text-xs font-semibold text-[#fcfbfa]">
            ตั้งเวลาเปิด-ปิดอัตโนมัติ
          </h2>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
            กำลังทำงาน
          </span>
        </div>
        <p className="text-[11px] text-[#8b95a5] mt-1">
          โคมไฟจะเปิดและดับอัตโนมัติตามช่วงเวลา
        </p>
      </div>

      {/* Digital Clock Stepper Cards */}
      <div className="grid grid-cols-2 gap-3 my-2 w-full">
        {/* Turn ON Card */}
        <div className="bg-[#0e1117] p-4 rounded-2xl border border-[#222834] flex flex-col items-center justify-between">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-[11px] font-medium text-[#c5cedc] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />
              เวลาเปิดไฟ
            </span>
            <span className="text-[10px] font-mono text-[#505a6a]">START</span>
          </div>

          <div className="flex items-center justify-center gap-1 py-1">
            <input
              type="number"
              min="0"
              max="23"
              value={onH}
              onChange={(e) => setOnH(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
              disabled={disabled}
              className="w-12 bg-[#141820] border border-[#272e3b] rounded-lg py-1.5 text-center font-mono text-xl font-bold text-[#fcfbfa] focus:outline-none focus:border-[#d4af37]"
            />
            <span className="font-mono text-xl font-bold text-[#505a6a]">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={onM}
              onChange={(e) => setOnM(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              disabled={disabled}
              className="w-12 bg-[#141820] border border-[#272e3b] rounded-lg py-1.5 text-center font-mono text-xl font-bold text-[#fcfbfa] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <span className="text-center text-[10px] text-[#505a6a] mt-1">ชั่วโมง : นาที</span>
        </div>

        {/* Turn OFF Card */}
        <div className="bg-[#0e1117] p-4 rounded-2xl border border-[#222834] flex flex-col items-center justify-between">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-[11px] font-medium text-[#c5cedc] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              เวลาปิดไฟ
            </span>
            <span className="text-[10px] font-mono text-[#505a6a]">END</span>
          </div>

          <div className="flex items-center justify-center gap-1 py-1">
            <input
              type="number"
              min="0"
              max="23"
              value={offH}
              onChange={(e) => setOffH(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
              disabled={disabled}
              className="w-12 bg-[#141820] border border-[#272e3b] rounded-lg py-1.5 text-center font-mono text-xl font-bold text-[#fcfbfa] focus:outline-none focus:border-[#d4af37]"
            />
            <span className="font-mono text-xl font-bold text-[#505a6a]">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={offM}
              onChange={(e) => setOffM(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              disabled={disabled}
              className="w-12 bg-[#141820] border border-[#272e3b] rounded-lg py-1.5 text-center font-mono text-xl font-bold text-[#fcfbfa] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <span className="text-center text-[10px] text-[#505a6a] mt-1">ชั่วโมง : นาที</span>
        </div>
      </div>

      {/* Presets and Save Action Centered */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 w-full">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[11px] text-[#505a6a] mr-0.5">ช่วงเวลา:</span>
          <button
            onClick={() => applyPreset(18, 0, 6, 0)}
            disabled={disabled}
            className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-[#0e1117] hover:bg-[#141820] text-[#c5cedc] hover:text-[#fcfbfa] border border-[#222834] transition-colors cursor-pointer disabled:opacity-40"
          >
            18:00–06:00
          </button>
          <button
            onClick={() => applyPreset(21, 0, 5, 30)}
            disabled={disabled}
            className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-[#0e1117] hover:bg-[#141820] text-[#c5cedc] hover:text-[#fcfbfa] border border-[#222834] transition-colors cursor-pointer disabled:opacity-40"
          >
            21:00–05:30
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={disabled}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 ${
            saved
              ? 'bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] shadow-[0_0_16px_rgba(212,175,55,0.4)]'
              : 'bg-[#141820] hover:bg-[#1a202c] text-[#fcfbfa] border border-[#272e3b]'
          }`}
        >
          {saved ? (
            <span>บันทึกแล้ว</span>
          ) : (
            <>
              <span>บันทึก</span>
              <span className="font-mono text-[11px] text-[#d4af37]">
                {format2(onH)}:{format2(onM)} → {format2(offH)}:{format2(offM)}
              </span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};

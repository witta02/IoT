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
    <section className="p-6 bg-[#0e1117]/80 backdrop-blur-xl border border-[#222834]/80 rounded-3xl shadow-xl transition-all duration-300 hover:border-[#d4af37]/30 select-none flex flex-col items-center text-center">
      {/* Centered Header */}
      <div className="flex flex-col items-center mb-4 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            <h2 className="text-xs font-bold text-[#fcfbfa]">
              ตั้งเวลาเปิด-ปิดอัตโนมัติ
            </h2>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
            ระบบทำงานอยู่
          </span>
        </div>
        <p className="text-[11px] text-[#8b95a5] mt-1.5 text-left w-full">
          โคมไฟจะเปิดและดับตามเวลาที่คุณกำหนด
        </p>
      </div>

      {/* Interactive Time Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3 w-full">
        {/* Turn ON Card */}
        <div className="bg-[#141820] p-4 rounded-2xl border border-[#222834] flex flex-col items-center justify-between">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-semibold text-[#c5cedc] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />
              เวลาเปิดไฟ
            </span>
            <span className="text-[10px] font-mono font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
              START
            </span>
          </div>

          {/* Time Selectors (Pure Numbers) */}
          <div className="flex items-center justify-center gap-2 py-1 w-full">
            {/* Hour Select */}
            <div className="flex flex-col items-center flex-1">
              <select
                value={onH}
                onChange={(e) => setOnH(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-[#0e1117] border border-[#272e3b] hover:border-[#d4af37]/50 rounded-xl py-2.5 text-center font-mono text-2xl font-bold text-[#fcfbfa] focus:outline-none focus:border-[#d4af37] cursor-pointer appearance-none text-center"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} className="bg-[#0e1117] text-[#fcfbfa]">
                    {format2(i)}
                  </option>
                ))}
              </select>
            </div>

            <span className="font-mono text-2xl font-bold text-[#505a6a]">:</span>

            {/* Minute Select */}
            <div className="flex flex-col items-center flex-1">
              <select
                value={onM}
                onChange={(e) => setOnM(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-[#0e1117] border border-[#272e3b] hover:border-[#d4af37]/50 rounded-xl py-2.5 text-center font-mono text-2xl font-bold text-[#fcfbfa] focus:outline-none focus:border-[#d4af37] cursor-pointer appearance-none text-center"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i} className="bg-[#0e1117] text-[#fcfbfa]">
                    {format2(i)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Turn OFF Card */}
        <div className="bg-[#141820] p-4 rounded-2xl border border-[#222834] flex flex-col items-center justify-between">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-semibold text-[#c5cedc] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              เวลาปิดไฟ
            </span>
            <span className="text-[10px] font-mono font-bold text-[#8b95a5] bg-[#0e1117] px-2 py-0.5 rounded border border-[#222834]">
              END
            </span>
          </div>

          {/* Time Selectors (Pure Numbers) */}
          <div className="flex items-center justify-center gap-2 py-1 w-full">
            {/* Hour Select */}
            <div className="flex flex-col items-center flex-1">
              <select
                value={offH}
                onChange={(e) => setOffH(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-[#0e1117] border border-[#272e3b] hover:border-[#d4af37]/50 rounded-xl py-2.5 text-center font-mono text-2xl font-bold text-[#fcfbfa] focus:outline-none focus:border-[#d4af37] cursor-pointer appearance-none text-center"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} className="bg-[#0e1117] text-[#fcfbfa]">
                    {format2(i)}
                  </option>
                ))}
              </select>
            </div>

            <span className="font-mono text-2xl font-bold text-[#505a6a]">:</span>

            {/* Minute Select */}
            <div className="flex flex-col items-center flex-1">
              <select
                value={offM}
                onChange={(e) => setOffM(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-[#0e1117] border border-[#272e3b] hover:border-[#d4af37]/50 rounded-xl py-2.5 text-center font-mono text-2xl font-bold text-[#fcfbfa] focus:outline-none focus:border-[#d4af37] cursor-pointer appearance-none text-center"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i} className="bg-[#0e1117] text-[#fcfbfa]">
                    {format2(i)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Presets and Save Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 w-full">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#8b95a5] mr-0.5">ช่วงเวลา:</span>
          <button
            onClick={() => applyPreset(18, 0, 6, 0)}
            disabled={disabled}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-xl bg-[#141820] hover:bg-[#1c222d] text-[#c5cedc] hover:text-[#fcfbfa] border border-[#222834] transition-colors cursor-pointer disabled:opacity-40"
          >
            ทั้งคืน (18:00–06:00)
          </button>
          <button
            onClick={() => applyPreset(21, 0, 5, 30)}
            disabled={disabled}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-xl bg-[#141820] hover:bg-[#1c222d] text-[#c5cedc] hover:text-[#fcfbfa] border border-[#222834] transition-colors cursor-pointer disabled:opacity-40"
          >
            ก่อนนอน (21:00–05:30)
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={disabled}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 ${
            saved
              ? 'bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] shadow-[0_0_16px_rgba(212,175,55,0.4)]'
              : 'bg-[#1c222d] hover:bg-[#252c3a] text-[#fcfbfa] border border-[#d4af37]/40 hover:border-[#d4af37]'
          }`}
        >
          {saved ? (
            <span>บันทึกเรียบร้อย</span>
          ) : (
            <>
              <span>บันทึกเวลา</span>
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

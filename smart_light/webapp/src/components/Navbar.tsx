import React from 'react';
import type { DeviceConnection } from '../types';

interface NavbarProps {
  connection: DeviceConnection;
  onOpenConnectModal: () => void;
  onOpenWifiModal: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  connection,
  onOpenConnectModal,
  onOpenWifiModal,
  onRefresh,
  isSyncing
}) => {
  const isConnected = connection.status === 'connected';

  const getConnectionBadge = () => {
    if (!isConnected) {
      return (
        <span className="text-xs px-3.5 py-2 rounded-xl bg-[#141820] hover:bg-[#1a202c] text-[#8b95a5] hover:text-[#fcfbfa] border border-[#222834] font-semibold cursor-pointer transition-all shadow-sm">
          เชื่อมต่อโคมไฟ
        </span>
      );
    }
    if (connection.mode === 'ble') {
      return (
        <span className="text-xs px-3.5 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />
          บลูทูธ (เชื่อมต่อแล้ว)
        </span>
      );
    }
    if (connection.mode === 'mqtt') {
      return (
        <span className="text-xs px-3.5 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37] animate-pulse" />
          ออนไลน์ (อินเทอร์เน็ต)
        </span>
      );
    }
    return (
      <span className="text-xs px-3.5 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all">
        <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
        เชื่อมต่อแล้ว (Wi-Fi)
      </span>
    );
  };

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-[#222834]/80 select-none text-center sm:text-left">
      <div className="flex flex-col items-center sm:items-start">
        <h1 className="text-xl font-extrabold tracking-tight text-[#fcfbfa] flex items-center gap-2">
          All Light
        </h1>
        <p className="text-xs text-[#8b95a5]">ระบบควบคุมโคมไฟอัจฉริยะ</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onOpenWifiModal}
          className="text-xs px-3 py-2 rounded-xl bg-[#141820] hover:bg-[#1a202c] text-[#8b95a5] hover:text-[#d4af37] border border-[#222834] transition-all cursor-pointer select-none font-medium flex items-center gap-1.5"
          title="เลือก Wi-Fi ให้บอร์ด"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" strokeLinecap="round" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" strokeLinecap="round" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">ตั้งค่า Wi-Fi</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isSyncing || !isConnected}
          className="text-xs px-3.5 py-2 rounded-xl bg-[#141820] hover:bg-[#1a202c] text-[#8b95a5] hover:text-[#fcfbfa] border border-[#222834] transition-all disabled:opacity-30 cursor-pointer select-none font-medium flex items-center gap-1.5"
        >
          <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          {isSyncing ? 'กำลังซิงค์...' : 'รีเฟรช'}
        </button>

        <div onClick={onOpenConnectModal}>
          {getConnectionBadge()}
        </div>
      </div>
    </header>
  );
};

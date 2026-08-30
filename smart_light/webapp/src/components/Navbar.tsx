import React from 'react';
import type { DeviceConnection } from '../types';
import { AllightLogo } from './AllightLogo';

interface NavbarProps {
  connection: DeviceConnection;
  onOpenConnectModal: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  connection,
  onOpenConnectModal,
  onRefresh,
  isSyncing
}) => {
  const isConnected = connection.status === 'connected';

  const getConnectionBadge = () => {
    if (!isConnected) {
      return (
        <span className="text-xs px-3.5 py-1.5 rounded-lg bg-[#141820] hover:bg-[#1a202c] text-[#8b95a5] hover:text-[#fcfbfa] border border-[#222834] font-semibold cursor-pointer">
          เชื่อมต่อโคมไฟ
        </span>
      );
    }
    if (connection.mode === 'ble') {
      return (
        <span className="text-xs px-3.5 py-1.5 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />
          เชื่อมต่อแล้ว (บลูทูธ)
        </span>
      );
    }
    if (connection.mode === 'mqtt') {
      return (
        <span className="text-xs px-3.5 py-1.5 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37] animate-pulse" />
          ออนไลน์ (อินเทอร์เน็ต)
        </span>
      );
    }
    return (
      <span className="text-xs px-3.5 py-1.5 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
        <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
        เชื่อมต่อแล้ว (Wi-Fi)
      </span>
    );
  };

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 mb-6 border-b border-[#222834] select-none text-center sm:text-left">
      <div className="flex items-center gap-3">
        <AllightLogo size={36} />
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-base font-bold tracking-tight text-[#fcfbfa] flex items-center gap-2">
            All Light
          </h1>
          <p className="text-xs text-[#8b95a5]">ระบบควบคุมโคมไฟอัจฉริยะ</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isSyncing || !isConnected}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#141820] hover:bg-[#1a202c] text-[#8b95a5] hover:text-[#fcfbfa] border border-[#222834] transition-colors disabled:opacity-30 cursor-pointer select-none"
        >
          {isSyncing ? 'กำลังอัปเดต...' : 'อัปเดตสถานะ'}
        </button>

        <div onClick={onOpenConnectModal}>
          {getConnectionBadge()}
        </div>
      </div>
    </header>
  );
};

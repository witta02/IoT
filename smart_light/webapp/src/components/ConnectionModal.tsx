import React, { useState } from 'react';
import type { DeviceConnection } from '../types';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: DeviceConnection;
  onConnectBle: () => Promise<void>;
  onConnectWifi: (ip: string) => Promise<void>;
  onConnectMqtt: (username?: string, password?: string) => Promise<void>;
  onDisconnect: () => void;
  isBleSupported: boolean;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  connection,
  onConnectBle,
  onConnectWifi,
  onConnectMqtt,
  onDisconnect,
  isBleSupported
}) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'mqtt' | 'ble' | 'wifi' | 'qr'>('auto');
  const [wifiIp, setWifiIp] = useState('http://smartlight.local');
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoStatus, setAutoStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click Smart Auto-Connect
  const handleAutoConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    setAutoStatus('กำลังตรวจสอบ Wi-Fi ในบ้าน (smartlight.local)...');

    try {
      // 1. Try Local LAN Wi-Fi first (< 200ms)
      await onConnectWifi('http://smartlight.local');
      setAutoStatus('เชื่อมต่อผ่าน Wi-Fi สำเร็จ!');
      setTimeout(onClose, 400);
      return;
    } catch {
      // 2. Fallback to Cloud MQTT (100% WAN reachable)
      try {
        setAutoStatus('กำลังเชื่อมต่อ Cloud MQTT (4G/5G)...');
        await onConnectMqtt('smartlight', 'SmartLight1234');
        setAutoStatus('เชื่อมต่อผ่าน Cloud สำเร็จ!');
        setTimeout(onClose, 400);
        return;
      } catch (err: any) {
        // 3. Fallback to BLE if supported
        if (isBleSupported) {
          try {
            setAutoStatus('กำลังค้นหา Bluetooth Low Energy...');
            await onConnectBle();
            setAutoStatus('เชื่อมต่อผ่าน BLE สำเร็จ!');
            setTimeout(onClose, 400);
            return;
          } catch (bleErr: any) {
            setErrorMessage('ไม่สามารถเชื่อมต่ออัตโนมัติได้ โปรดเลือกแท็บบลูทูธหรือไวไฟโดยตรง');
          }
        } else {
          setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อคลาวด์ได้');
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBleClick = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      await onConnectBle();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่พบบลูทูธของโคมไฟ โปรดตรวจดูว่าเปิด Bluetooth แล้ว');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWifiClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      await onConnectWifi(wifiIp);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถติดต่อโคมไฟตามที่อยู่นี้ได้');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMqttClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      await onConnectMqtt('smartlight', 'SmartLight1234');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อ Cloud Broker ได้');
    } finally {
      setIsConnecting(false);
    }
  };

  const getConnectionModeName = () => {
    if (connection.mode === 'ble') return 'บลูทูธ';
    if (connection.mode === 'wifi') return 'ไวไฟในบ้าน';
    if (connection.mode === 'mqtt') return 'อินเทอร์เน็ต';
    return 'ออนไลน์';
  };

  // Priority: Vercel WebApp URL -> Live Origin -> allight.local
  const getAppUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.origin.includes('vercel.app')) return window.location.href;
      if (window.location.origin.includes('http')) return window.location.href;
    }
    return 'https://allight.vercel.app';
  };

  const currentAppUrl = getAppUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    currentAppUrl
  )}&color=d4af37&bgcolor=0e1117`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-[#0e1117] border border-[#222834] rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#222834]">
          <h2 className="text-sm font-bold text-[#fcfbfa] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
            เชื่อมต่อโคมไฟ All Light
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-[#8b95a5] hover:text-[#fcfbfa] cursor-pointer"
          >
            ปิด
          </button>
        </div>

        {connection.status === 'connected' && (
          <div className="my-3 p-3 bg-[#141820] border border-[#222834] rounded-xl flex items-center justify-between">
            <div className="text-xs">
              <span className="text-[#d4af37] block font-bold">เชื่อมต่ออยู่</span>
              <span className="text-[#8b95a5]">{getConnectionModeName()}</span>
            </div>
            <button
              onClick={() => {
                onDisconnect();
                onClose();
              }}
              className="text-xs px-2.5 py-1 rounded bg-[#1c222d] hover:bg-[#252c3a] text-zinc-300 border border-[#222834] hover:border-[#d4af37]/40 cursor-pointer"
            >
              ตัดการเชื่อมต่อ
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="grid grid-cols-5 gap-1 bg-[#141820] p-1 rounded-xl my-3 border border-[#222834]">
          {[
            { id: 'auto', label: 'อัตโนมัติ' },
            { id: 'mqtt', label: 'ทางไกล' },
            { id: 'ble', label: 'บลูทูธ' },
            { id: 'wifi', label: 'ไวไฟ' },
            { id: 'qr', label: 'สแกน QR' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setErrorMessage(null);
                setAutoStatus(null);
              }}
              className={`py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-center ${
                activeTab === tab.id
                  ? 'bg-[#1c222d] border border-[#d4af37]/50 text-[#d4af37] shadow-sm'
                  : 'text-[#8b95a5] hover:text-[#fcfbfa]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1-Click Auto Connect */}
        {activeTab === 'auto' && (
          <div className="space-y-3 py-1 text-center">
            <p className="text-xs text-[#8b95a5] leading-relaxed">
              ระบบจะค้นหาและเชื่อมต่อโคมไฟที่พร้อมใช้งานให้อัตโนมัติ
            </p>
            {autoStatus && (
              <div className="p-2.5 bg-[#141820] border border-[#d4af37]/30 text-xs text-[#d4af37] rounded-xl animate-pulse">
                {autoStatus}
              </div>
            )}
            <button
              onClick={handleAutoConnect}
              disabled={isConnecting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] font-bold text-xs cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-[#d4af37]/20 hover:brightness-110"
            >
              {isConnecting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อทันที'}
            </button>
          </div>
        )}

        {/* Remote Internet Tab */}
        {activeTab === 'mqtt' && (
          <form onSubmit={handleMqttClick} className="space-y-3 py-1">
            <p className="text-xs text-[#8b95a5] leading-relaxed">
              ควบคุมโคมไฟได้จากทุกที่ผ่านเน็ตมือถือหรือไวไฟ
            </p>
            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] font-bold text-xs cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-[#d4af37]/20 hover:brightness-110"
            >
              {isConnecting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อผ่านอินเทอร์เน็ต'}
            </button>
          </form>
        )}

        {/* Bluetooth Tab */}
        {activeTab === 'ble' && (
          <div className="space-y-3 py-1">
            {!isBleSupported ? (
              <div className="p-3 bg-[#141820] text-xs text-[#d4af37] rounded-xl border border-[#d4af37]/30">
                เบราว์เซอร์นี้ไม่รองรับบลูทูธ (บน iPhone แนะนำให้เชื่อมต่อผ่านอินเทอร์เน็ต)
              </div>
            ) : (
              <>
                <p className="text-xs text-[#8b95a5] leading-relaxed">
                  เชื่อมต่อตรงกับโคมไฟโดยไม่ต้องใช้อินเทอร์เน็ต (ระยะใกล้ ~10 เมตร)
                </p>
                <button
                  onClick={handleBleClick}
                  disabled={isConnecting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] font-bold text-xs cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-[#d4af37]/20 hover:brightness-110"
                >
                  {isConnecting ? 'กำลังค้นหา...' : 'ค้นหาโคมไฟใกล้ตัว'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Wi-Fi Tab */}
        {activeTab === 'wifi' && (
          <form onSubmit={handleWifiClick} className="space-y-3 py-1">
            <p className="text-xs text-[#8b95a5]">
              เชื่อมต่อผ่านสัญญาณไวไฟในบ้าน
            </p>
            <div>
              <label className="block text-xs text-[#8b95a5] mb-1 font-medium">
                ที่อยู่โคมไฟ:
              </label>
              <input
                type="text"
                value={wifiIp}
                onChange={(e) => setWifiIp(e.target.value)}
                className="w-full bg-[#141820] border border-[#222834] rounded-lg px-3 py-2 text-xs text-[#fcfbfa] focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setWifiIp('http://allight.local')}
                className="px-2 py-1 rounded bg-[#141820] text-[#8b95a5] text-[11px] border border-[#222834] hover:text-[#d4af37]"
              >
                allight.local
              </button>
            </div>
            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] font-bold text-xs cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-[#d4af37]/20 hover:brightness-110"
            >
              {isConnecting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อไวไฟ'}
            </button>
          </form>
        )}

        {/* Instant QR Code Tab for Mobile Phone Scan */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center justify-center space-y-3 py-2 text-center">
            <p className="text-xs text-[#8b95a5]">
              ใช้กล้องมือถือสแกนเพื่อเปิดใช้งานบนโทรศัพท์
            </p>
            <div className="p-2.5 bg-[#141820] border border-[#222834] rounded-2xl shadow-inner">
              <img
                src={qrCodeUrl}
                alt="All Light WebApp QR"
                className="w-36 h-36 rounded-xl"
              />
            </div>
            <a 
              href={currentAppUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-[11px] text-[#d4af37] hover:underline break-all max-w-[260px]"
            >
              เปิดหน้าควบคุม All Light
            </a>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-2.5 bg-[#141820] border border-[#d4af37]/40 text-xs text-[#d4af37] rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-[#222834] text-[11px] text-[#8b95a5] text-center">
          สวิตช์ปุ่มกดที่ตัวโคมไฟ สามารถกดเปิด-ปิดได้ตลอดเวลา
        </div>
      </div>
    </div>
  );
};

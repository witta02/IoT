import React, { useState, useEffect, useCallback } from 'react';
import type { DeviceConnection, SmartLightState, WifiNetwork } from '../types';
import { bleService } from '../services/bleService';
import { apiService } from '../services/apiService';

interface WifiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: DeviceConnection;
  currentState: SmartLightState;
  onConnectBle: () => Promise<void>;
  onStateUpdate: (state: Partial<SmartLightState>) => void;
}

export const WifiConfigModal: React.FC<WifiConfigModalProps> = ({
  isOpen,
  onClose,
  connection,
  currentState,
  onConnectBle,
  onStateUpdate
}) => {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [selectedSsid, setSelectedSsid] = useState('');
  const [customSsid, setCustomSsid] = useState('');
  const [isManualSsid, setIsManualSsid] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  const canCommunicate = connection.status === 'connected' && (connection.mode === 'ble' || connection.mode === 'wifi');

  // Handle BLE Wi-Fi callbacks
  useEffect(() => {
    if (connection.mode === 'ble') {
      bleService.setWifiScanCallback((scannedList) => {
        setIsScanning(false);
        setNetworks(scannedList);
        if (scannedList.length > 0 && !selectedSsid) {
          setSelectedSsid(scannedList[0].ssid);
        }
        setStatusMessage({
          type: 'info',
          text: `พบ ${scannedList.length} เครือข่าย Wi-Fi ในบริเวณใกล้เคียง`
        });
      });

      bleService.setWifiStatusCallback((info) => {
        if (info.event === 'wifiConnecting') {
          setStatusMessage({
            type: 'info',
            text: `กำลังเชื่อมต่อกับ ${info.ssid || 'Wi-Fi'}...`
          });
        } else if (info.event === 'wifiReset') {
          setStatusMessage({
            type: 'success',
            text: 'ล้างค่า Wi-Fi เรียบร้อยแล้ว บอร์ดเปิด SoftAP allight-Setup'
          });
          onStateUpdate({ wifi: false, ssid: '', ip: '192.168.4.1' });
        }
      });
    }

    return () => {
      if (connection.mode === 'ble') {
        bleService.setWifiScanCallback(null);
        bleService.setWifiStatusCallback(null);
      }
    };
  }, [connection.mode, selectedSsid, onStateUpdate]);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setStatusMessage(null);

    try {
      if (connection.mode === 'ble') {
        await bleService.scanWifi();
      } else if (connection.mode === 'wifi') {
        const list = await apiService.scanWifi();
        setNetworks(list);
        if (list.length > 0 && !selectedSsid) {
          setSelectedSsid(list[0].ssid);
        }
        setStatusMessage({
          type: 'info',
          text: `พบ ${list.length} เครือข่าย Wi-Fi`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'โปรดเชื่อมต่อบลูทูธหรือเครือข่าย allight-Setup ก่อนทำการสแกน'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'ไม่สามารถสแกน Wi-Fi ได้'
      });
    } finally {
      if (connection.mode !== 'ble') {
        setIsScanning(false);
      }
    }
  }, [connection.mode, selectedSsid]);

  // Trigger scan when modal opens if already connected
  useEffect(() => {
    if (isOpen && canCommunicate && networks.length === 0 && !isScanning) {
      handleScan();
    }
  }, [isOpen, canCommunicate, networks.length, isScanning, handleScan]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ssid = isManualSsid ? customSsid.trim() : selectedSsid.trim();
    if (!ssid) {
      setStatusMessage({ type: 'error', text: 'โปรดระบุชื่อเครือข่าย Wi-Fi (SSID)' });
      return;
    }

    setIsSaving(true);
    setStatusMessage({ type: 'info', text: `กำลังบันทึกและเชื่อมต่อกับ ${ssid}...` });

    try {
      if (connection.mode === 'ble') {
        await bleService.saveWifi(ssid, password);
        setStatusMessage({
          type: 'success',
          text: `ส่งข้อมูลเรียบร้อย บอร์ดกำลังเชื่อมต่อไปยัง ${ssid}`
        });
      } else if (connection.mode === 'wifi') {
        await apiService.saveWifi(ssid, password);
        setStatusMessage({
          type: 'success',
          text: `บันทึกแล้ว บอร์ดกำลังเชื่อมต่อกับ ${ssid}`
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'บันทึก Wi-Fi ไม่สำเร็จ'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetWifi = async () => {
    if (!window.confirm('คุณต้องการลบ Wi-Fi ที่บันทึกไว้ในบอร์ด และกลับไปใช้ Setup AP หรือไม่?')) return;
    try {
      if (connection.mode === 'ble') {
        await bleService.resetWifi();
      } else if (connection.mode === 'wifi') {
        await apiService.resetWifi();
        setStatusMessage({
          type: 'success',
          text: 'ลบข้อมูล Wi-Fi สำเร็จ บอร์ดเปิด SoftAP allight-Setup'
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'ล้างค่าไม่สำเร็จ' });
    }
  };

  const getRssiBars = (rssi: number) => {
    if (rssi >= -60) return '●●●● (แรงมาก)';
    if (rssi >= -70) return '●●●○ (ดี)';
    if (rssi >= -80) return '●●○○ (ปานกลาง)';
    return '●○○○ (อ่อน)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-[#0e1117] border border-[#222834] rounded-2xl p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222834]">
          <h2 className="text-sm font-bold text-[#fcfbfa] flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" strokeLinecap="round" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" strokeLinecap="round" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" strokeLinecap="round" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" strokeLinecap="round" />
            </svg>
            ตั้งค่า Wi-Fi สำหรับโคมไฟ
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-[#8b95a5] hover:text-[#fcfbfa] cursor-pointer"
          >
            ปิด
          </button>
        </div>

        {/* Current Wi-Fi Status Banner */}
        <div className="my-3 p-3 bg-[#141820] border border-[#222834] rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#8b95a5]">สถานะบอร์ด:</span>
            <span className={`font-semibold ${currentState.wifi ? 'text-emerald-400' : 'text-[#d4af37]'}`}>
              {currentState.wifi ? 'เชื่อมต่อ Wi-Fi แล้ว' : 'โหมด Setup AP / ออฟไลน์'}
            </span>
          </div>
          {currentState.ssid && (
            <div className="flex items-center justify-between">
              <span className="text-[#8b95a5]">ชื่อ Wi-Fi ปัจจุบัน:</span>
              <span className="text-[#fcfbfa] font-mono">{currentState.ssid}</span>
            </div>
          )}
          {currentState.ip && (
            <div className="flex items-center justify-between">
              <span className="text-[#8b95a5]">IP Address:</span>
              <span className="text-[#d4af37] font-mono">{currentState.ip}</span>
            </div>
          )}
        </div>

        {!canCommunicate ? (
          <div className="py-3 text-center space-y-3">
            <p className="text-xs text-[#8b95a5] leading-relaxed">
              การเลือก Wi-Fi ให้บอร์ด ต้องเชื่อมต่อบลูทูธหรือ Wi-Fi ฮอตสปอต <strong className="text-[#fcfbfa]">allight-Setup</strong> ก่อน
            </p>
            <button
              onClick={async () => {
                try {
                  await onConnectBle();
                } catch {
                  // error handled inside connect
                }
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] font-bold text-xs cursor-pointer shadow-md shadow-[#d4af37]/20 hover:brightness-110"
            >
              เชื่อมต่อบลูทูธเพื่อตั้งค่า Wi-Fi
            </button>
            <p className="text-[11px] text-[#8b95a5]">
              หรือเชื่อมต่อ Wi-Fi ในมือถือไปที่ <strong>allight-Setup</strong> แล้วเปิด <strong>http://192.168.4.1</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3 py-1">
            {/* Scan Controls & Network Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#fcfbfa]">เครือข่าย Wi-Fi ที่ค้นพบ</label>
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="text-[11px] px-2 py-0.5 rounded bg-[#1c222d] hover:bg-[#252c3a] text-[#d4af37] border border-[#222834] flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <svg className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  {isScanning ? 'กำลังสแกน...' : 'สแกนใหม่'}
                </button>
              </div>

              {!isManualSsid ? (
                <div className="space-y-1.5">
                  <select
                    value={selectedSsid}
                    onChange={(e) => setSelectedSsid(e.target.value)}
                    className="w-full bg-[#141820] border border-[#222834] focus:border-[#d4af37] text-xs text-[#fcfbfa] rounded-xl p-2.5 outline-none"
                  >
                    {networks.length === 0 ? (
                      <option value="">{isScanning ? 'กำลังสแกนสัญญาณ...' : '-- กดปุ่มสแกนใหม่เพื่อค้นหา --'}</option>
                    ) : (
                      networks.map((net, i) => (
                        <option key={`${net.ssid}-${i}`} value={net.ssid}>
                          {net.ssid} ({getRssiBars(net.rssi)}{net.sec ? ' 🔒' : ''})
                        </option>
                      ))
                    )}
                  </select>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setIsManualSsid(true)}
                      className="text-[11px] text-[#8b95a5] hover:text-[#d4af37] underline cursor-pointer"
                    >
                      กรอกชื่อ Wi-Fi เอง (SSID ที่ซ่อนไว้)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อ Wi-Fi (SSID)"
                    value={customSsid}
                    onChange={(e) => setCustomSsid(e.target.value)}
                    className="w-full bg-[#141820] border border-[#222834] focus:border-[#d4af37] text-xs text-[#fcfbfa] rounded-xl p-2.5 outline-none font-mono"
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setIsManualSsid(false)}
                      className="text-[11px] text-[#8b95a5] hover:text-[#d4af37] underline cursor-pointer"
                    >
                      กลับไปเลือกจากรายการสแกน
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="text-xs font-semibold text-[#fcfbfa] block mb-1.5">รหัสผ่าน Wi-Fi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="รหัสผ่าน Wi-Fi (เว้นว่างถ้าเป็น Wi-Fi เปิด)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141820] border border-[#222834] focus:border-[#d4af37] text-xs text-[#fcfbfa] rounded-xl p-2.5 pr-10 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8b95a5] hover:text-[#fcfbfa] cursor-pointer"
                >
                  {showPassword ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>

            {statusMessage && (
              <div
                className={`p-2.5 text-xs rounded-xl border ${
                  statusMessage.type === 'error'
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                    : statusMessage.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-[#141820] border-[#d4af37]/40 text-[#d4af37]'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving || isScanning || (!isManualSsid && !selectedSsid)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#fef08a] via-[#d4af37] to-[#b45309] text-[#07080a] font-bold text-xs cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-[#d4af37]/20 hover:brightness-110"
            >
              {isSaving ? 'กำลังบันทึกและเชื่อมต่อ...' : 'บันทึกและเชื่อมต่อ Wi-Fi'}
            </button>

            <div className="pt-2 border-t border-[#222834] flex items-center justify-between text-[11px]">
              <span className="text-[#8b95a5]">ลืมเครือข่ายเดิม:</span>
              <button
                type="button"
                onClick={handleResetWifi}
                className="text-rose-400 hover:text-rose-300 cursor-pointer font-medium"
              >
                ล้างค่า Wi-Fi (Reset)
              </button>
            </div>
          </form>
        )}

        <div className="mt-3 pt-2.5 border-t border-[#222834] text-[11px] text-[#8b95a5] text-center">
          กดปุ่มที่บอร์ดค้าง 5 วินาที เพื่อล้างค่า Wi-Fi ทางฮาร์ดแวร์ได้ตลอดเวลา
        </div>
      </div>
    </div>
  );
};

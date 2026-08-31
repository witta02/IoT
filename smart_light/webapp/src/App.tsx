import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LightCard } from './components/LightCard';
import { ModeSelector } from './components/ModeSelector';
import { LdrSensorCard } from './components/LdrSensorCard';
import { ScheduleCard } from './components/ScheduleCard';
import { ConnectionModal } from './components/ConnectionModal';
import type { SmartLightState, DeviceConnection } from './types';
import { bleService } from './services/bleService';
import { apiService } from './services/apiService';
import { mqttService } from './services/mqttService';

export const App: React.FC = () => {
  const [state, setState] = useState<SmartLightState>({
    light: false,
    mode: 0,
    ldrValue: 1250,
    ldrThreshold: 1500,
    onHour: 18,
    onMin: 0,
    offHour: 6,
    offMin: 0,
    time: '--:--:--',
    ble: false,
    wifi: false
  });

  const [connection, setConnection] = useState<DeviceConnection>({
    mode: 'none',
    status: 'disconnected'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBleSupported, setIsBleSupported] = useState(true);

  useEffect(() => {
    setIsBleSupported(bleService.isSupported());
  }, []);

  const handleStateUpdate = useCallback((newState: Partial<SmartLightState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  // ─── BACKGROUND AUTO-CONNECT ON LAUNCH ─────────────────────────────────────
  useEffect(() => {
    let unmounted = false;
    const tryAutoConnect = async () => {
      // 1. If loaded from ESP32 local web server
      if (window.location.hostname && window.location.hostname !== 'localhost') {
        try {
          apiService.setBaseUrl(`http://${window.location.hostname}`);
          const data = await apiService.getStatus();
          if (!unmounted) {
            handleStateUpdate(data);
            setConnection({
              mode: 'wifi',
              status: 'connected',
              ipAddress: window.location.hostname
            });
            apiService.startPolling(1500, (p) => handleStateUpdate(p));
            return;
          }
        } catch {
          // ignore & fallback to cloud MQTT
        }
      }

      // 2. Seamless Cloud MQTT Auto-Connect (WSS 8084)
      try {
        await mqttService.connect(
          { username: 'smartlight', password: 'SmartLight1234' },
          (data) => {
            if (!unmounted) {
              handleStateUpdate(data);
              setConnection((prev) => ({ ...prev, status: 'connected' }));
            }
          },
          () => {
            if (!unmounted) {
              setConnection({ mode: 'none', status: 'disconnected' });
            }
          }
        );
        if (!unmounted) {
          setConnection({ mode: 'mqtt', status: 'connected' });
        }
      } catch (err) {
        console.log('Background cloud connect deferred to user action:', err);
      }
    };

    tryAutoConnect();
    return () => {
      unmounted = true;
    };
  }, [handleStateUpdate]);

  const handleConnectBle = async () => {
    setConnection({ mode: 'ble', status: 'connecting' });
    try {
      const deviceName = await bleService.connect(
        (data) => {
          handleStateUpdate(data);
          setConnection((prev) => ({ ...prev, status: 'connected', deviceName }));
        },
        () => {
          setConnection({ mode: 'none', status: 'disconnected', error: 'บลูทูธถูกตัดการเชื่อมต่อ' });
        }
      );

      setConnection({
        mode: 'ble',
        status: 'connected',
        deviceName: deviceName || 'โคมไฟอัจฉริยะ'
      });
    } catch (err: any) {
      setConnection({ mode: 'none', status: 'disconnected', error: err.message });
      throw err;
    }
  };

  const handleConnectWifi = async (ip: string) => {
    setConnection({ mode: 'wifi', status: 'connecting', ipAddress: ip });
    apiService.setBaseUrl(ip);

    try {
      const data = await apiService.getStatus();
      handleStateUpdate(data);
      setConnection({
        mode: 'wifi',
        status: 'connected',
        ipAddress: apiService.getBaseUrl()
      });

      apiService.startPolling(
        1500,
        (pollData) => handleStateUpdate(pollData),
        (pollErr) => console.warn('Poll warn:', pollErr)
      );
    } catch (err: any) {
      setConnection({ mode: 'none', status: 'disconnected', error: err.message });
      throw err;
    }
  };

  const handleConnectMqtt = async (username?: string, password?: string) => {
    setConnection({ mode: 'mqtt', status: 'connecting' });
    try {
      await mqttService.connect(
        { username, password },
        (data) => {
          handleStateUpdate(data);
          setConnection((prev) => ({ ...prev, status: 'connected' }));
        },
        () => {
          setConnection({ mode: 'none', status: 'disconnected', error: 'คลาวด์ MQTT ถูกตัดการเชื่อมต่อ' });
        }
      );

      setConnection({
        mode: 'mqtt',
        status: 'connected'
      });
    } catch (err: any) {
      setConnection({ mode: 'none', status: 'disconnected', error: err.message });
      throw err;
    }
  };

  const handleDisconnect = () => {
    if (connection.mode === 'ble') {
      bleService.disconnect();
    } else if (connection.mode === 'wifi') {
      apiService.stopPolling();
    } else if (connection.mode === 'mqtt') {
      mqttService.disconnect();
    }
    setConnection({ mode: 'none', status: 'disconnected' });
  };

  const handleRefresh = async () => {
    if (connection.status !== 'connected') return;
    setIsSyncing(true);

    try {
      if (connection.mode === 'wifi') {
        const data = await apiService.getStatus();
        handleStateUpdate(data);
      } else if (connection.mode === 'ble') {
        await bleService.sendCommand({ action: 'getStatus' });
      } else if (connection.mode === 'mqtt') {
        mqttService.sendCommand({ action: 'getStatus' });
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  };

  const handleToggle = async () => {
    const nextState = !state.light;
    setState((prev) => ({ ...prev, light: nextState, mode: 0 }));

    if (connection.status === 'connected') {
      try {
        if (connection.mode === 'ble') {
          await bleService.sendCommand({ action: 'toggle' });
        } else if (connection.mode === 'wifi') {
          const res = await apiService.toggle();
          handleStateUpdate(res);
        } else if (connection.mode === 'mqtt') {
          mqttService.sendCommand({ action: 'toggle' });
        }
      } catch (err) {
        console.error('Toggle error:', err);
      }
    }
  };

  const handleSelectMode = async (mode: number) => {
    setState((prev) => ({ ...prev, mode }));

    if (connection.status === 'connected') {
      try {
        if (connection.mode === 'ble') {
          await bleService.sendCommand({ mode });
        } else if (connection.mode === 'wifi') {
          const res = await apiService.setMode(mode);
          handleStateUpdate(res);
        } else if (connection.mode === 'mqtt') {
          mqttService.sendCommand({ mode });
        }
      } catch (err) {
        console.error('Mode error:', err);
      }
    }
  };

  const handleUpdateThreshold = async (threshold: number) => {
    setState((prev) => ({ ...prev, ldrThreshold: threshold }));

    if (connection.status === 'connected') {
      try {
        if (connection.mode === 'ble') {
          await bleService.sendCommand({ threshold });
        } else if (connection.mode === 'wifi') {
          const res = await apiService.setThreshold(threshold);
          handleStateUpdate(res);
        } else if (connection.mode === 'mqtt') {
          mqttService.sendCommand({ threshold });
        }
      } catch (err) {
        console.error('Threshold error:', err);
      }
    }
  };

  const handleSaveSchedule = async (onH: number, onM: number, offH: number, offM: number) => {
    setState((prev) => ({
      ...prev,
      onHour: onH,
      onMin: onM,
      offHour: offH,
      offMin: offM
    }));

    if (connection.status === 'connected') {
      try {
        if (connection.mode === 'ble') {
          await bleService.sendCommand({
            onHour: onH,
            onMin: onM,
            offHour: offH,
            offMin: offM
          });
        } else if (connection.mode === 'wifi') {
          const res = await apiService.setSchedule(onH, onM, offH, offM);
          handleStateUpdate(res);
        } else if (connection.mode === 'mqtt') {
          mqttService.sendCommand({
            onHour: onH,
            onMin: onM,
            offHour: offH,
            offMin: offM
          });
        }
      } catch (err) {
        console.error('Save schedule error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8 sm:px-6 max-w-4xl mx-auto flex flex-col justify-between">
      <div>
        <Navbar
          connection={connection}
          onOpenConnectModal={() => setIsModalOpen(true)}
          onRefresh={handleRefresh}
          isSyncing={isSyncing}
        />

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Hero Luminaire Control Card */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <LightCard
              state={state}
              onToggle={handleToggle}
              onSelectMode={handleSelectMode}
              disabled={false}
            />
          </div>

          {/* Right Column: Intelligent Automations Deck */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <ModeSelector
              currentMode={state.mode}
              onSelectMode={handleSelectMode}
              disabled={false}
            />

            {state.mode === 2 && (
              <LdrSensorCard
                ldrValue={state.ldrValue}
                ldrThreshold={state.ldrThreshold}
                onUpdateThreshold={handleUpdateThreshold}
                disabled={false}
              />
            )}

            {state.mode === 1 && (
              <ScheduleCard
                onHour={state.onHour}
                onMin={state.onMin}
                offHour={state.offHour}
                offMin={state.offMin}
                onSaveSchedule={handleSaveSchedule}
                disabled={false}
              />
            )}

            {state.mode === 0 && (
              <div className="p-6 bg-[#0e1117]/80 backdrop-blur-xl border border-[#222834]/80 rounded-3xl shadow-xl flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#141820] border border-[#222834] flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#d4af37] fill-none stroke-current stroke-2">
                    <path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold text-[#fcfbfa] mb-1">โหมดควบคุมด้วยตนเอง</h3>
                <p className="text-[11px] text-[#8b95a5] leading-relaxed max-w-xs">
                  ควบคุมการเปิด-ปิดได้ทันทีผ่านสวิตช์บนหน้าจอ หรือกดปุ่มจริงที่ตัวโคมไฟโดยตรง
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="pt-10 pb-4 text-center text-xs text-[#8b95a5] flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#222834]/40 mt-10">
        <span>All Light • Autonomous Smart Luminaire</span>
        <span className="text-[11px] text-[#505a6a]">ตอบสนองทันที &lt; 15ms</span>
      </footer>

      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        connection={connection}
        onConnectBle={handleConnectBle}
        onConnectWifi={handleConnectWifi}
        onConnectMqtt={handleConnectMqtt}
        onDisconnect={handleDisconnect}
        isBleSupported={isBleSupported}
      />
    </div>
  );
};

export default App;

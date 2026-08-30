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
    <div className="min-h-screen px-4 py-8 sm:px-6 max-w-lg mx-auto flex flex-col justify-between">
      <div>
        <Navbar
          connection={connection}
          onOpenConnectModal={() => setIsModalOpen(true)}
          onRefresh={handleRefresh}
          isSyncing={isSyncing}
        />

        <main>
          <LightCard
            state={state}
            onToggle={handleToggle}
            disabled={false}
          />

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
        </main>
      </div>

      <footer className="pt-8 pb-4 text-center text-xs text-[#8b95a5]">
        All Light • สวิตช์ปุ่มกดฮาร์ดแวร์ทำงานได้ตลอดเวลาแม้ออฟไลน์
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

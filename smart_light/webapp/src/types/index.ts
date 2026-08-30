export interface SmartLightState {
  light: boolean;
  mode: number; // 0=Manual, 1=Auto-Time, 2=Auto-LDR
  ldrValue: number;
  ldrThreshold: number;
  onHour: number;
  onMin: number;
  offHour: number;
  offMin: number;
  time: string;
  ble?: boolean;
  wifi?: boolean;
}

export type ConnectionMode = 'ble' | 'wifi' | 'mqtt' | 'none';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DeviceConnection {
  mode: ConnectionMode;
  status: ConnectionStatus;
  deviceName?: string;
  ipAddress?: string;
  error?: string;
}

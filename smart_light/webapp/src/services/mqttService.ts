import mqtt from 'mqtt';
import type { SmartLightState } from '../types';

export const MQTT_DEFAULT_HOST = 'broker.emqx.io';
export const MQTT_WS_URL = `wss://${MQTT_DEFAULT_HOST}:8084/mqtt`;
export const MQTT_TOPIC_CMD = 'smartlight/witta02/cmd';
export const MQTT_TOPIC_STATE = 'smartlight/witta02/state';

class MqttService {
  private client: mqtt.MqttClient | null = null;
  private onStateCallback: ((state: Partial<SmartLightState>) => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  public connect(
    options: {
      username?: string;
      password?: string;
      wsUrl?: string;
    },
    onState: (state: Partial<SmartLightState>) => void,
    onDisconnect?: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.disconnect();

      this.onStateCallback = onState;
      this.onDisconnectCallback = onDisconnect || null;

      const url = options.wsUrl || MQTT_WS_URL;
      const clientId = 'smartlight-web-' + Math.random().toString(16).substring(2, 8);

      console.log('[MQTT] Connecting to:', url);

      this.client = mqtt.connect(url, {
        clientId,
        protocol: 'wss',
        clean: true,
        connectTimeout: 10000,
        reconnectPeriod: 3000
      });

      this.client.on('connect', () => {
        console.log('[MQTT] Connected to Global Cloud Broker');
        this.client?.subscribe(MQTT_TOPIC_STATE, (err) => {
          if (err) {
            console.error('MQTT subscribe error:', err);
          } else {
            const epoch = Math.floor(Date.now() / 1000);
            this.sendCommand({ action: 'syncTime', epoch });
            this.sendCommand({ action: 'getStatus' });
          }
        });
        resolve();
      });

      this.client.on('message', (topic, payload) => {
        if (topic === MQTT_TOPIC_STATE) {
          try {
            const data = JSON.parse(payload.toString());
            this.onStateCallback?.(data);
          } catch (e) {
            console.warn('MQTT JSON parse warn:', e);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('MQTT Error:', err);
        reject(err);
      });

      this.client.on('close', () => {
        console.log('MQTT Closed');
        this.onDisconnectCallback?.();
      });
    });
  }

  public sendCommand(cmd: Record<string, any>): boolean {
    if (!this.client || !this.client.connected) {
      console.warn('MQTT client not connected');
      return false;
    }
    const message = JSON.stringify(cmd);
    this.client.publish(MQTT_TOPIC_CMD, message, { qos: 0 });
    return true;
  }

  public isConnected(): boolean {
    return this.client?.connected || false;
  }

  public disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

export const mqttService = new MqttService();

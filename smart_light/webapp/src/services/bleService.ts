import type { SmartLightState } from '../types';

export const BLE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const BLE_RX_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'; // Write to ESP32
export const BLE_TX_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9'; // Notify from ESP32

export class BleService {
  private device: BluetoothDevice | null = null;
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onStatusCallback: ((status: SmartLightState) => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  public getDeviceName(): string | undefined {
    return this.device?.name;
  }

  public async connect(
    onStatus: (status: SmartLightState) => void,
    onDisconnect: () => void
  ): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Bluefy on iOS.');
    }

    this.onStatusCallback = onStatus;
    this.onDisconnectCallback = onDisconnect;

    try {
      console.log('[BLE] Scanning for All Light BLE device...');
      
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'allight' },
          { namePrefix: 'allight' },
          { name: 'All Light' },
          { namePrefix: 'All Light' },
          { namePrefix: 'ESP32' },
          { services: [BLE_SERVICE_UUID] }
        ],
        optionalServices: [BLE_SERVICE_UUID]
      }).catch(async (err) => {
        // Fallback for broad scans if name filter is not matched
        console.warn('[BLE] Filter scan failed, attempting open scan...', err);
        return await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [BLE_SERVICE_UUID]
        });
      });

      if (!this.device || !this.device.gatt) {
        throw new Error('No Bluetooth device selected.');
      }

      this.device.addEventListener('gattserverdisconnected', this.handleDisconnected);

      console.log('Connecting to GATT Server on:', this.device.name);
      const server = await this.device.gatt.connect();

      console.log('Getting Service:', BLE_SERVICE_UUID);
      const service = await server.getPrimaryService(BLE_SERVICE_UUID);

      console.log('Getting Characteristics...');
      this.rxCharacteristic = await service.getCharacteristic(BLE_RX_UUID);
      this.txCharacteristic = await service.getCharacteristic(BLE_TX_UUID);

      // Start notifications on TX Characteristic
      await this.txCharacteristic.startNotifications();
      this.txCharacteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);

      // Try reading initial state
      try {
        const initialVal = await this.txCharacteristic.readValue();
        this.parseAndDispatch(initialVal);
      } catch (readErr) {
        console.log('Could not read initial value directly, waiting for notify:', readErr);
      }

      return this.device.name || 'ESP32-SmartLight';
    } catch (err: any) {
      this.disconnect();
      throw err;
    }
  }

  public async sendCommand(command: Record<string, any>): Promise<void> {
    if (!this.rxCharacteristic || !this.isConnected()) {
      throw new Error('Bluetooth is not connected.');
    }

    const jsonStr = JSON.stringify(command);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr);

    console.log('📱 [BLE TX] Sending:', jsonStr);
    
    if (this.rxCharacteristic.writeValueWithResponse) {
      await this.rxCharacteristic.writeValueWithResponse(data);
    } else {
      await this.rxCharacteristic.writeValue(data);
    }
  }

  public disconnect(): void {
    if (this.txCharacteristic) {
      try {
        this.txCharacteristic.removeEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
      } catch (e) {
        // ignore
      }
    }

    if (this.device) {
      try {
        this.device.removeEventListener('gattserverdisconnected', this.handleDisconnected);
        if (this.device.gatt?.connected) {
          this.device.gatt.disconnect();
        }
      } catch (e) {
        // ignore
      }
    }

    this.device = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
  }

  private handleCharacteristicValueChanged = (event: Event) => {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    if (characteristic.value) {
      this.parseAndDispatch(characteristic.value);
    }
  };

  private parseAndDispatch(dataView: DataView) {
    try {
      const decoder = new TextDecoder('utf-8');
      const jsonStr = decoder.decode(dataView);
      console.log('📱 [BLE RX] Received status:', jsonStr);
      const parsed: SmartLightState = JSON.parse(jsonStr);
      if (this.onStatusCallback) {
        this.onStatusCallback(parsed);
      }
    } catch (err) {
      console.error('Failed to parse BLE notification packet:', err);
    }
  }

  private handleDisconnected = () => {
    console.warn('📱 [BLE] Device disconnected unexpectedly.');
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }
    this.disconnect();
  };
}

export const bleService = new BleService();

import type { SmartLightState } from '../types';

export class ApiService {
  private baseUrl: string = 'http://allight.local';
  private pollingTimer: number | null = null;

  public setBaseUrl(url: string) {
    // Ensure clean URL format
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `http://${clean}`;
    }
    if (clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    this.baseUrl = clean;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async getStatus(): Promise<SmartLightState> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const res = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  public async toggle(): Promise<SmartLightState> {
    const res = await fetch(`${this.baseUrl}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  }

  public async setLight(state: boolean): Promise<SmartLightState> {
    const res = await fetch(`${this.baseUrl}/setLight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setLight', state: state ? 1 : 0 })
    });
    return await res.json();
  }

  public async setMode(mode: number): Promise<SmartLightState> {
    const res = await fetch(`${this.baseUrl}/setMode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    return await res.json();
  }

  public async setThreshold(threshold: number): Promise<SmartLightState> {
    const res = await fetch(`${this.baseUrl}/setThreshold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threshold })
    });
    return await res.json();
  }

  public async setSchedule(onHour: number, onMin: number, offHour: number, offMin: number): Promise<SmartLightState> {
    const res = await fetch(`${this.baseUrl}/setSchedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onHour, onMin, offHour, offMin })
    });
    return await res.json();
  }

  public startPolling(intervalMs: number, onStatus: (status: SmartLightState) => void, onError?: (err: any) => void) {
    this.stopPolling();
    
    // Initial fetch
    this.getStatus().then(onStatus).catch(err => {
      if (onError) onError(err);
    });

    this.pollingTimer = window.setInterval(async () => {
      try {
        const data = await this.getStatus();
        onStatus(data);
      } catch (err) {
        if (onError) onError(err);
      }
    }, intervalMs);
  }

  public stopPolling() {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}

export const apiService = new ApiService();

// Lightweight haptic feedback only (no audio sound)
class HapticEngine {
  public playHaptic(isOn: boolean) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(isOn ? 15 : 10);
      } catch (e) {}
    }
  }
}

export const hapticEngine = new HapticEngine();

type EventMap = {
  'network:connected': { sessionId: string };
  'network:disconnected': { reason: string };
  'game:phaseChanged': { from: string; to: string };
  'game:battleStart': { grid: any };
  'game:battleTick': { tick: number };
  'game:victory': { winner: number; stats: any[] };
  'ui:sidebarToggle': { side: 'left' | 'right' };
  'ui:paramsChanged': { params: any };
  'renderer:cellCaptured': { index: number; owner: number };
};

export class EventBus {
  private listeners: Map<keyof EventMap, Set<(data: any) => void>> = new Map();

  on<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Event handler error for ${event}:`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();

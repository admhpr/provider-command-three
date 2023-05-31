export type EventHandler = (...args: any[]) => void;

export class EventBridge {
  private eventHandlers: Map<string, EventHandler[]>;

  constructor() {
    this.eventHandlers = new Map();
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(eventType: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }

  subscribeDOM(eventType: string, element: HTMLElement, handler: EventHandler): void {
    element.addEventListener(eventType, handler);
  }

  unsubscribeDOM(eventType: string, element: HTMLElement, handler: EventHandler): void {
    element.removeEventListener(eventType, handler);
  }
}

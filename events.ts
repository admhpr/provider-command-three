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
}

export class CanvasEventListener {
  private canvas: HTMLCanvasElement;
  private eventBridge: EventBridge;

  constructor(canvas: HTMLCanvasElement, eventBridge: EventBridge) {
    this.canvas = canvas;
    this.eventBridge = eventBridge;
  }

  public setupEventListeners(): void {
    
    // Mouse Events
    this.canvas.addEventListener('click', (event) => {
      this.eventBridge.emit('canvasClick', event);
    });

    this.canvas.addEventListener('mousemove', (event) => {
      this.eventBridge.emit('canvasMouseMove', event);
    });
    
    this.canvas.addEventListener('mousedown', (event) => {
      this.eventBridge.emit('canvasMouseDown', event);
    });
    
    this.canvas.addEventListener('mouseup', (event) => {
      this.eventBridge.emit('canvasMouseUp', event);
    });
    
    this.canvas.addEventListener('mouseover', (event) => {
      this.eventBridge.emit('canvasMouseOver', event);
    });
    
    this.canvas.addEventListener('mouseout', (event) => {
      this.eventBridge.emit('canvasMouseOut', event);
    });
    
    // Keyboard Events
    this.canvas.addEventListener('keydown', (event) => {
      this.eventBridge.emit('canvasKeyDown', event);
    });
    
    this.canvas.addEventListener('keyup', (event) => {
      this.eventBridge.emit('canvasKeyUp', event);
    });
    
    this.canvas.addEventListener('keypress', (event) => {
      this.eventBridge.emit('canvasKeyPress', event);
    });
  }
}
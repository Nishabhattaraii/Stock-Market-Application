type MessageHandler = (data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Set<MessageHandler> = new Set();
  private isConnected = false;
  private reconnectTimer: any = null;

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/v1/ws/dashboard`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.notifyListeners({ event: 'status', status: 'online' });
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.notifyListeners({ event: 'status', status: 'offline' });
        // Attempt reconnect after 5 seconds
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };
    } catch (e) {
      console.error('Failed to initialize WebSocket:', e);
    }
  }

  public subscribe(handler: MessageHandler) {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  private notifyListeners(data: any) {
    this.listeners.forEach((handler) => handler(data));
  }

  public getStatus() {
    return this.isConnected;
  }
}

export const wsClient = new WebSocketClient();

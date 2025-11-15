import { Shape } from "../TypeShape";

/**
 * Handles WebSocket communication and message processing
 */
export class WebSocketHandler {
  private socket: WebSocket;
  private roomId: string;
  private onShapeUpdate: (shape: Shape) => void;
  private onShapeDelete: (id: string) => void;
  private onClearAll: () => void;

  constructor(
    socket: WebSocket,
    roomId: string,
    callbacks: {
      onShapeUpdate: (shape: Shape) => void;
      onShapeDelete: (id: string) => void;
      onClearAll: () => void;
    }
  ) {
    this.socket = socket;
    this.roomId = roomId;
    this.onShapeUpdate = callbacks.onShapeUpdate;
    this.onShapeDelete = callbacks.onShapeDelete;
    this.onClearAll = callbacks.onClearAll;
    
    this.initMessageHandler();
  }

  /**
   * Initialize WebSocket message handler
   */
  private initMessageHandler() {
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        // Handle clear all request
        if (message.type === "clear_all") {
          this.onClearAll();
          return;
        }

        // Handle shape deletion
        if (message.type === "delete") {
          const parsed = JSON.parse(message.message);
          const shapeId = parsed.id || parsed.payload?.id;
          if (shapeId) {
            this.onShapeDelete(shapeId);
          }
          return;
        }

        // Handle shape creation (chat)
        if (message.type === "chat") {
          const parsed = JSON.parse(message.message);
          const shape = parsed.shape;
          if (shape && shape.type) {
            this.onShapeUpdate(shape);
          }
          return;
        }

        // Handle shape update (move/resize)
        if (message.type === "update") {
          const parsed = JSON.parse(message.message);
          const shape = parsed.shape;
          if (shape && shape.type) {
            this.onShapeUpdate(shape);
          }
          return;
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
  }

  /**
   * Send shape update to server
   */
  sendShapeUpdate(shape: Shape, type: "chat" | "update") {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type,
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      }));
    }
  }

  /**
   * Send shape deletion to server
   */
  sendShapeDelete(shapeId: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: "delete",
        payload: { id: shapeId },
        roomId: this.roomId,
      }));
    }
  }

  /**
   * Send clear all request to server
   */
  sendClearAll() {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: "clear_all",
        roomId: this.roomId,
      }));
    }
  }
}

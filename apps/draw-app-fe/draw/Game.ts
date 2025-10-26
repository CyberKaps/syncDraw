import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { Shape } from "./TypeShape";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private currentPath: Array<{ x: number; y: number }> = [];
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private activeTextInput: HTMLInputElement | null = null;

  // Drag/resize state
  private draggingShape: Shape | null = null;
  private draggingMode: "move" | "resize" | null = null;
  private resizeHandleIndex: number | null = null;
  private dragOffset = { x: 0, y: 0 };
  private lastSentAt = 0;
  private isDragging = false;

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    if (this.activeTextInput) {
      document.body.removeChild(this.activeTextInput);
      this.activeTextInput = null;
    }
    this.draggingShape = null;
    this.draggingMode = null;
    this.resizeHandleIndex = null;
    this.isDragging = false;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId) || [];
    this.existingShapes = this.existingShapes.map((s) => {
      if (!(s as any).id) (s as any).id = this.genId();
      return s;
    });
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message); // Debug log

        // Incoming shape creation
        if (message.type === "chat") {
          const parsedShape = JSON.parse(message.message);
          const incoming: Shape = parsedShape.shape;
          if (!incoming.id) (incoming as any).id = this.genId();
          
          // Don't process our own messages if they echo back
          if (this.isDragging && this.draggingShape && (this.draggingShape as any).id === (incoming as any).id) {
            return;
          }
          
          const idx = this.existingShapes.findIndex((s) => (s as any).id === (incoming as any).id);
          if (idx >= 0) {
            this.existingShapes[idx] = incoming;
          } else {
            this.existingShapes.push(incoming);
          }
          this.clearCanvas();
        }

        // Incoming updates (move/resize)
        if (message.type === "update") {
          const parsed = JSON.parse(message.message);
          const incoming: Shape = parsed.shape;
          if (!incoming.id) (incoming as any).id = this.genId();
          
          // Don't process our own updates
          if (this.isDragging && this.draggingShape && (this.draggingShape as any).id === (incoming as any).id) {
            return;
          }
          
          const idx = this.existingShapes.findIndex((s) => (s as any).id === (incoming as any).id);
          if (idx >= 0) {
            this.existingShapes[idx] = incoming;
            this.clearCanvas();
          }
        }
      } catch (err) {
        console.warn("WebSocket message parse error:", err);
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = "rgba(255, 255, 255)";
      this.ctx.fillStyle = "white";
      this.drawShape(shape);
    });

    if (this.draggingShape) {
      this.drawHandles(this.draggingShape);
    }
  }

  // Drawing helpers (keep your existing drawShape, drawHandles, etc.)
  private drawShape(shape: Shape) {
    if (shape.type === "rect") {
      this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      this.ctx.beginPath();
      this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "pencil") {
      this.ctx.beginPath();
      const points = shape.points;
      if (points.length > 0) {
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) this.ctx.lineTo(points[i].x, points[i].y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(shape.startX, shape.startY);
      this.ctx.lineTo(shape.endX, shape.endY);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "arrow") {
      this.ctx.beginPath();
      this.ctx.moveTo(shape.startX, shape.startY);
      this.ctx.lineTo(shape.endX, shape.endY);
      this.ctx.stroke();

      const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
      const headLength = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(shape.endX, shape.endY);
      this.ctx.lineTo(
        shape.endX - headLength * Math.cos(angle - Math.PI / 6),
        shape.endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.moveTo(shape.endX, shape.endY);
      this.ctx.lineTo(
        shape.endX - headLength * Math.cos(angle + Math.PI / 6),
        shape.endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "diamond") {
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, shape.y);
      this.ctx.lineTo(shape.x + shape.width, centerY);
      this.ctx.lineTo(centerX, shape.y + shape.height);
      this.ctx.lineTo(shape.x, centerY);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (shape.type === "text") {
      const fontSize = (shape as any).fontSize || 16;
      this.ctx.font = `${fontSize}px sans-serif`;
      this.ctx.fillStyle = "white";
      this.ctx.fillText(shape.content, shape.x, shape.y);
    }
  }

  private drawHandles(shape: Shape) {
    const handles = this.getHandlesForShape(shape);
    if (!handles) return;

    this.ctx.save();
    this.ctx.fillStyle = "rgba(255,255,255,0.9)";
    handles.forEach((p) => {
      this.ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
    });
    this.ctx.restore();
  }

  private genId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private pointNear(a: { x: number; y: number }, b: { x: number; y: number }, tolerance = 8) {
    return Math.hypot(a.x - b.x, a.y - b.y) <= tolerance;
  }

  private getBoundingBox(shape: Shape) {
    if (shape.type === "rect" || shape.type === "diamond") {
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    } else if (shape.type === "circle") {
      return { x: shape.centerX - Math.abs(shape.radius), y: shape.centerY - Math.abs(shape.radius), width: Math.abs(shape.radius) * 2, height: Math.abs(shape.radius) * 2 };
    } else if (shape.type === "line" || shape.type === "arrow") {
      const minX = Math.min(shape.startX, shape.endX);
      const minY = Math.min(shape.startY, shape.endY);
      const maxX = Math.max(shape.startX, shape.endX);
      const maxY = Math.max(shape.startY, shape.endY);
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } else if (shape.type === "pencil") {
      const xs = shape.points.map(p => p.x);
      const ys = shape.points.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } else if (shape.type === "text") {
      const fontSize = (shape as any).fontSize || 16;
      const width = (shape.content.length || 1) * fontSize * 0.6;
      const height = fontSize;
      return { x: shape.x, y: shape.y - height, width, height };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  private getHandlesForShape(shape: Shape) {
    const box = this.getBoundingBox(shape);
    if (box.width === 0 && box.height === 0) return null;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const handles = [
      { x: box.x, y: box.y },
      { x: box.x + box.width, y: box.y },
      { x: box.x + box.width, y: box.y + box.height },
      { x: box.x, y: box.y + box.height },
      { x: cx, y: box.y },
      { x: box.x + box.width, y: cy },
      { x: cx, y: box.y + box.height },
      { x: box.x, y: cy }
    ];
    return handles;
  }

  private pickShapeAt(x: number, y: number) {
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const s = this.existingShapes[i];
      if (s.type === "line" || s.type === "arrow") {
        if (this.pointNear({ x, y }, { x: s.startX, y: s.startY }, 8)) return { shape: s, handleIndex: 0 };
        if (this.pointNear({ x, y }, { x: s.endX, y: s.endY }, 8)) return { shape: s, handleIndex: 1 };
        if (this.pointNearPointToSegment({ x, y }, { x: s.startX, y: s.startY }, { x: s.endX, y: s.endY }, 6)) return { shape: s, handleIndex: null };
      } else if (s.type === "pencil") {
        for (let pi = 0; pi < s.points.length; pi++) {
          if (this.pointNear({ x, y }, s.points[pi], 8)) return { shape: s, handleIndex: pi };
        }
        const bb = this.getBoundingBox(s);
        if (x >= bb.x && x <= bb.x + bb.width && y >= bb.y && y <= bb.y + bb.height) return { shape: s, handleIndex: null };
      } else {
        const handles = this.getHandlesForShape(s);
        if (handles) {
          for (let hi = 0; hi < handles.length; hi++) {
            if (this.pointNear({ x, y }, handles[hi], 8)) return { shape: s, handleIndex: hi };
          }
        }
        const bb = this.getBoundingBox(s);
        if (x >= bb.x && x <= bb.x + bb.width && y >= bb.y && y <= bb.y + bb.height) return { shape: s, handleIndex: null };
      }
    }
    return null;
  }

  private pointNearPointToSegment(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }, tol = 6) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) return this.pointNear(p, a, tol);
    const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
    const clamped = Math.max(0, Math.min(1, t));
    const proj = { x: a.x + clamped * dx, y: a.y + clamped * dy };
    return this.pointNear(p, proj, tol);
  }

  mouseDownHandler = (e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    if (this.selectedTool === "text") {
      if (this.activeTextInput) {
        document.body.removeChild(this.activeTextInput);
        this.activeTextInput = null;
      }
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Type here...";
      input.style.position = "fixed";
      input.style.left = `${x}px`;
      input.style.top = `${y}px`;
      input.style.background = "transparent";
      input.style.color = "white";
      input.style.border = "1px solid #888";
      input.style.font = "16px sans-serif";
      input.style.padding = "2px 4px";
      input.style.zIndex = "1000";
      document.body.appendChild(input);
      input.focus();
      this.activeTextInput = input;

      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          const value = input.value.trim();
          if (value.length > 0) {
            const shape: Shape = {
              ...( { id: this.genId() } as any),
              type: "text",
              x,
              y,
              content: value,
              fontSize: 16
            } as any;
            this.existingShapes.push(shape);
            this.sendShapeUpdate(shape, "chat");
            this.clearCanvas();
          }
          document.body.removeChild(input);
          this.activeTextInput = null;
        } else if (ev.key === "Escape") {
          document.body.removeChild(input);
          this.activeTextInput = null;
        }
      });
      return;
    }

    const picked = this.pickShapeAt(x, y);
    if (picked && picked.shape) {
      this.draggingShape = picked.shape;
      this.startX = x;
      this.startY = y;
      this.isDragging = true;

      if (picked.handleIndex !== null) {
        this.draggingMode = "resize";
        this.resizeHandleIndex = picked.handleIndex;
      } else {
        this.draggingMode = "move";
        this.resizeHandleIndex = null;
        const bb = this.getBoundingBox(picked.shape);
        this.dragOffset = { x: x - bb.x, y: y - bb.y };
      }

      this.clicked = true;
      return;
    }

    this.clicked = true;
    this.startX = x;
    this.startY = y;

    if (this.selectedTool === "pencil") {
      this.currentPath = [{ x, y }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.draggingShape) {
      this.sendShapeUpdate(this.draggingShape, "update");
      this.draggingShape = null;
      this.draggingMode = null;
      this.resizeHandleIndex = null;
      this.isDragging = false;
      this.clicked = false;
      this.clearCanvas();
      return;
    }

    this.clicked = false;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;
    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = { id: this.genId(), type: "rect", x: this.startX, y: this.startY, width, height } as any;
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        id: this.genId(),
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      } as any;
    } else if (selectedTool === "pencil" && this.currentPath.length > 0) {
      shape = { id: this.genId(), type: "pencil", points: [...this.currentPath] } as any;
      this.currentPath = [];
    } else if (selectedTool === "line") {
      shape = { id: this.genId(), type: "line", startX: this.startX, startY: this.startY, endX: e.clientX, endY: e.clientY } as any;
    } else if (selectedTool === "arrow") {
      shape = { id: this.genId(), type: "arrow", startX: this.startX, startY: this.startY, endX: e.clientX, endY: e.clientY } as any;
    } else if (selectedTool === "diamond") {
      shape = { id: this.genId(), type: "diamond", x: this.startX, y: this.startY, width, height } as any;
    }

    if (!shape) return;

    this.existingShapes.push(shape);
    this.sendShapeUpdate(shape, "chat");
    this.clearCanvas();
  };

  mouseMoveHandler = (e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    if (this.clicked && this.draggingShape && this.draggingMode) {
      const ds = this.draggingShape;

      if (this.draggingMode === "move") {
        const bb = this.getBoundingBox(ds);
        const targetX = x - this.dragOffset.x;
        const targetY = y - this.dragOffset.y;
        
        const dx = targetX - bb.x;
        const dy = targetY - bb.y;

        if (ds.type === "rect" || ds.type === "diamond") {
          ds.x = targetX;
          ds.y = targetY;
        } else if (ds.type === "circle") {
          ds.centerX += dx;
          ds.centerY += dy;
        } else if (ds.type === "line" || ds.type === "arrow") {
          ds.startX += dx;
          ds.startY += dy;
          ds.endX += dx;
          ds.endY += dy;
        } else if (ds.type === "pencil") {
          for (let i = 0; i < ds.points.length; i++) {
            ds.points[i].x += dx;
            ds.points[i].y += dy;
          }
        } else if (ds.type === "text") {
          ds.x += dx;
          ds.y += dy;
        }

        this.clearCanvas();
        this.maybeSendUpdate(ds);
        return;
      }

      if (this.draggingMode === "resize") {
        const hi = this.resizeHandleIndex ?? 0;
        
        if (ds.type === "rect" || ds.type === "diamond") {
          const bb = this.getBoundingBox(ds);
          let { x: bx, y: by, width: bw, height: bh } = bb;

          switch (hi) {
            case 0: bw = bw + (bx - x); bh = bh + (by - y); bx = x; by = y; break;
            case 1: bw = x - bx; bh = bh + (by - y); by = y; break;
            case 2: bw = x - bx; bh = y - by; break;
            case 3: bw = bw + (bx - x); bh = y - by; bx = x; break;
            case 4: bh = bh + (by - y); by = y; break;
            case 5: bw = x - bx; break;
            case 6: bh = y - by; break;
            case 7: bw = bw + (bx - x); bx = x; break;
          }
          bw = Math.max(6, bw);
          bh = Math.max(6, bh);
          ds.x = bx;
          ds.y = by;
          ds.width = bw;
          ds.height = bh;
        } else if (ds.type === "circle") {
          const center = { x: ds.centerX, y: ds.centerY };
          const newR = Math.max(2, Math.hypot(x - center.x, y - center.y));
          ds.radius = newR;
        } else if (ds.type === "line" || ds.type === "arrow") {
          if (hi === 0) { ds.startX = x; ds.startY = y; }
          else if (hi === 1) { ds.endX = x; ds.endY = y; }
        } else if (ds.type === "text") {
          const currentSize = (ds as any).fontSize || 16;
          const delta = y - this.startY;
          const newSize = Math.max(8, Math.round(currentSize + delta * 0.05));
          (ds as any).fontSize = newSize;
          this.startY = y;
        } else if (ds.type === "pencil") {
          if (typeof this.resizeHandleIndex === "number" && this.resizeHandleIndex >= 0 && this.resizeHandleIndex < ds.points.length) {
            ds.points[this.resizeHandleIndex].x = x;
            ds.points[this.resizeHandleIndex].y = y;
          }
        }

        this.clearCanvas();
        this.maybeSendUpdate(ds);
        return;
      }
      return;
    }

    if (this.clicked) {
      const width = x - this.startX;
      const height = y - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255, 255, 255)";
      const selectedTool = this.selectedTool;

      if (selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "pencil") {
        this.currentPath.push({ x, y });
        this.ctx.beginPath();
        const points = this.currentPath;
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "arrow") {
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        const angle = Math.atan2(y - this.startY, x - this.startX);
        const headLength = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
          x - headLength * Math.cos(angle - Math.PI / 6),
          y - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
          x - headLength * Math.cos(angle + Math.PI / 6),
          y - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "diamond") {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, this.startY);
        this.ctx.lineTo(this.startX + width, centerY);
        this.ctx.lineTo(centerX, this.startY + height);
        this.ctx.lineTo(this.startX, centerY);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  // ---------- Improved Networking helpers ----------
  private sendShapeUpdate(shape: Shape, messageType: "chat" | "update") {
    if (!(shape as any).id) (shape as any).id = this.genId();
    
    const message = {
      type: messageType,
      message: JSON.stringify({ shape }),
      roomId: this.roomId,
      senderId: this.getClientId() // Add sender ID to avoid echo
    };
    
    console.log("Sending:", message); // Debug log
    this.socket.send(JSON.stringify(message));
  }

  private maybeSendUpdate(shape: Shape) {
    const now = Date.now();
    if (now - this.lastSentAt > 50) {
      this.sendShapeUpdate(shape, "update");
      this.lastSentAt = now;
    }
  }

  private getClientId() {
    // Generate a persistent client ID for this session
    let clientId = localStorage.getItem('whiteboardClientId');
    if (!clientId) {
      clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('whiteboardClientId', clientId);
    }
    return clientId;
  }
}
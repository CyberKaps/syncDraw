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

  // Zoom & Pan state
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private minZoom = 0.1;
  private maxZoom = 5;

  // Callback for tool change
  private onToolChange?: (tool: Tool) => void;

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
    this.initZoomHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
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

  setToolChangeCallback(callback: (tool: Tool) => void) {
    this.onToolChange = callback;
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

        // Incoming clear all request
        if (message.type === "clear_all") {
          this.existingShapes = [];
          this.clearCanvas();
          return;
        }

        // Incoming shape deletion (eraser)
        if (message.type === "delete") {
          const parsed = JSON.parse(message.message);
          // Handle both formats: { id: ... } or { payload: { id: ... } }
          const shapeIdToDelete = parsed.id || parsed.payload?.id;
          if (shapeIdToDelete) {
            const idx = this.existingShapes.findIndex((s) => (s as any).id === shapeIdToDelete);
            if (idx >= 0) {
              this.existingShapes.splice(idx, 1);
              this.clearCanvas();
            }
          }
          return;
        }

        // Incoming shape creation
        if (message.type === "chat") {
          const parsedShape = JSON.parse(message.message);
          const incoming: Shape = parsedShape.shape;
          
          // Validate shape exists
          if (!incoming || !incoming.type) {
            console.warn("Received invalid shape:", parsedShape);
            return;
          }
          
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
          
          // Validate shape exists
          if (!incoming || !incoming.type) {
            console.warn("Received invalid shape update:", parsed);
            return;
          }
          
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
    // Clear and reset transform
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply zoom and pan transform
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

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
    // Handle panning with space key or middle mouse button
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this.isPanning = true;
      this.panStartX = e.clientX - this.panX;
      this.panStartY = e.clientY - this.panY;
      this.canvas.style.cursor = "grabbing";
      return;
    }

    // Convert screen coordinates to canvas coordinates
    const screenPos = { x: e.clientX, y: e.clientY };
    const canvasPos = this.screenToCanvas(screenPos.x, screenPos.y);
    const x = canvasPos.x;
    const y = canvasPos.y;

    if (this.selectedTool === "eraser") {
      const picked = this.pickShapeAt(x, y);
      if (picked && picked.shape) {
        const shapeToDelete = picked.shape;
        const index = this.existingShapes.indexOf(shapeToDelete);
        if (index > -1) {
          this.existingShapes.splice(index, 1);
          this.clearCanvas();
          // Broadcast deletion to other users
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
              type: "delete",
              payload: { id: (shapeToDelete as any).id },
              roomId: this.roomId
            }));
          }
        }
      }
      this.clicked = true;
      return;
    }

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
            
            // Auto-switch to select tool and select the text
            this.selectedTool = "select";
            this.draggingShape = shape;
            
            // Notify Canvas component to update UI
            if (this.onToolChange) {
              this.onToolChange("select");
            }
            
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

    // Only allow shape selection/dragging/resizing with select tool
    if (this.selectedTool === "select") {
      const picked = this.pickShapeAt(x, y);
      if (picked && picked.shape) {
        this.draggingShape = picked.shape;
        this.startX = x;
        this.startY = y;
        this.isDragging = false; // Changed to false - will be set to true on mousemove

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
        this.clearCanvas(); // Redraw to show handles
        return;
      }
      
      // If select tool is active and clicked on empty space, deselect current shape
      this.draggingShape = null;
      this.draggingMode = null;
      this.resizeHandleIndex = null;
      this.clearCanvas();
    }

    this.clicked = true;
    this.startX = x;
    this.startY = y;

    if (this.selectedTool === "pencil") {
      this.currentPath = [{ x, y }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    // End panning
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "default";
      return;
    }

    if (this.draggingShape) {
      // Only send update if the shape was actually dragged (not just clicked)
      if (this.isDragging) {
        this.sendShapeUpdate(this.draggingShape, "update");
      }
      
      // Keep the shape selected if it was just clicked (not dragged)
      if (!this.isDragging) {
        this.clicked = false;
        this.isDragging = false;
        this.clearCanvas(); // Redraw to keep handles visible
        return;
      }
      
      // Deselect after dragging/resizing
      this.draggingShape = null;
      this.draggingMode = null;
      this.resizeHandleIndex = null;
      this.isDragging = false;
      this.clicked = false;
      this.clearCanvas();
      return;
    }

    this.clicked = false;
    
    // Convert screen coordinates to canvas coordinates
    const screenPos = { x: e.clientX, y: e.clientY };
    const canvasPos = this.screenToCanvas(screenPos.x, screenPos.y);
    
    const width = canvasPos.x - this.startX;
    const height = canvasPos.y - this.startY;
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
      shape = { id: this.genId(), type: "line", startX: this.startX, startY: this.startY, endX: canvasPos.x, endY: canvasPos.y } as any;
    } else if (selectedTool === "arrow") {
      shape = { id: this.genId(), type: "arrow", startX: this.startX, startY: this.startY, endX: canvasPos.x, endY: canvasPos.y } as any;
    } else if (selectedTool === "diamond") {
      shape = { id: this.genId(), type: "diamond", x: this.startX, y: this.startY, width, height } as any;
    }

    if (!shape) return;

    this.existingShapes.push(shape);
    this.sendShapeUpdate(shape, "chat");
    
    // Auto-switch to select tool and select the newly created shape (except for pencil tool)
    if (selectedTool !== "select" && selectedTool !== "pencil") {
      this.selectedTool = "select";
      this.draggingShape = shape;
      this.draggingMode = null;
      this.resizeHandleIndex = null;
      
      // Notify Canvas component to update UI
      if (this.onToolChange) {
        this.onToolChange("select");
      }
    }
    
    this.clearCanvas();
  };

  mouseMoveHandler = (e: MouseEvent) => {
    // Handle panning
    if (this.isPanning) {
      this.panX = e.clientX - this.panStartX;
      this.panY = e.clientY - this.panStartY;
      this.clearCanvas();
      return;
    }

    // Convert screen coordinates to canvas coordinates
    const screenPos = { x: e.clientX, y: e.clientY };
    const canvasPos = this.screenToCanvas(screenPos.x, screenPos.y);
    const x = canvasPos.x;
    const y = canvasPos.y;

    // Handle continuous erasing while mouse is down
    if (this.clicked && this.selectedTool === "eraser") {
      const picked = this.pickShapeAt(x, y);
      if (picked && picked.shape) {
        const shapeToDelete = picked.shape;
        const index = this.existingShapes.indexOf(shapeToDelete);
        if (index > -1) {
          this.existingShapes.splice(index, 1);
          this.clearCanvas();
          // Broadcast deletion to other users
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
              type: "delete",
              payload: { id: (shapeToDelete as any).id },
              roomId: this.roomId
            }));
          }
        }
      }
      return;
    }

    if (this.clicked && this.draggingShape && this.draggingMode) {
      const ds = this.draggingShape;
      
      // Set isDragging to true only if mouse moved more than 3 pixels (drag threshold)
      if (!this.isDragging) {
        const dx = Math.abs(x - this.startX);
        const dy = Math.abs(y - this.startY);
        const dragThreshold = 3;
        
        if (dx > dragThreshold || dy > dragThreshold) {
          this.isDragging = true;
        } else {
          // Not enough movement yet, don't consider it a drag
          return;
        }
      }

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

  // ---------- Zoom & Pan methods ----------
  private screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.panX) / this.zoom,
      y: (screenY - this.panY) / this.zoom
    };
  }

  private canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
    return {
      x: canvasX * this.zoom + this.panX,
      y: canvasY * this.zoom + this.panY
    };
  }

  public setZoom(newZoom: number, centerX?: number, centerY?: number) {
    const oldZoom = this.zoom;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
    
    // Zoom towards cursor position if provided
    if (centerX !== undefined && centerY !== undefined) {
      const canvasPoint = this.screenToCanvas(centerX, centerY);
      this.panX = centerX - canvasPoint.x * this.zoom;
      this.panY = centerY - canvasPoint.y * this.zoom;
    }
    
    this.clearCanvas();
  }

  public getZoom(): number {
    return this.zoom;
  }

  public resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.clearCanvas();
  }

  public setPan(x: number, y: number) {
    this.panX = x;
    this.panY = y;
    this.clearCanvas();
  }

  public getShapes(): Shape[] {
    return this.existingShapes;
  }

  public clearAllShapes() {
    // Clear all shapes locally
    this.existingShapes = [];
    this.clearCanvas();
    
    // Broadcast clear all to other users
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: "clear_all",
        roomId: this.roomId
      }));
    }
  }

  private wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    
    const zoomIntensity = 0.1;
    const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    const newZoom = this.zoom * (1 + delta);
    
    this.setZoom(newZoom, e.clientX, e.clientY);
  };

  private initZoomHandlers() {
    this.canvas.addEventListener("wheel", this.wheelHandler, { passive: false });
    
    // Add keyboard shortcuts for zoom and delete
    window.addEventListener("keydown", (e) => {
      // Reset zoom shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        this.resetView();
      }
      
      // Delete selected shape with Delete or Backspace key
      if ((e.key === "Delete" || e.key === "Backspace") && this.draggingShape) {
        e.preventDefault();
        const shapeToDelete = this.draggingShape;
        const index = this.existingShapes.indexOf(shapeToDelete);
        
        if (index > -1) {
          // Remove from local array
          this.existingShapes.splice(index, 1);
          
          // Clear selection
          this.draggingShape = null;
          this.draggingMode = null;
          this.resizeHandleIndex = null;
          
          // Redraw canvas
          this.clearCanvas();
          
          // Broadcast deletion to other users
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
              type: "delete",
              payload: { id: (shapeToDelete as any).id },
              roomId: this.roomId
            }));
          }
        }
      }
    });
  }
}
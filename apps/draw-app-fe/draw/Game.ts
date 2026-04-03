import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { Shape } from "./TypeShape";
import { DrawingRenderer } from "./managers/DrawingRenderer";
import { ShapeManager } from "./managers/ShapeManager";
import { ZoomPanManager } from "./managers/ZoomPanManager";
import { WebSocketHandler } from "./managers/WebSocketHandler";
import { ShapeTransformer } from "./managers/ShapeTransformer";

/**
 * Main Game class - Orchestrates the drawing application
 * Refactored into focused manager modules for better maintainability
 */
export class Game {
  // Core dependencies
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: string;
  socket: WebSocket;

  // Manager modules
  private renderer: DrawingRenderer;
  private shapeManager: ShapeManager;
  private zoomPanManager: ZoomPanManager;
  private wsHandler: WebSocketHandler;
  private shapeTransformer: ShapeTransformer;

  // Shape data
  private existingShapes: Shape[] = [];

  // Drawing state
  private clicked = false;
  private currentPath: Array<{ x: number; y: number }> = [];
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private activeTextInput: HTMLInputElement | null = null;

  // Selection/drag state
  private draggingShape: Shape | null = null;
  private draggingMode: "move" | "resize" | null = null;
  private resizeHandleIndex: number | null = null;
  private dragOffset = { x: 0, y: 0 };
  private isDragging = false;
  private lastSentAt = 0;

  // Callbacks
  private onToolChange?: (tool: Tool) => void;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;

    // Initialize managers
    this.renderer = new DrawingRenderer(canvas, this.ctx);
    this.shapeManager = new ShapeManager();
    this.zoomPanManager = new ZoomPanManager();
    this.shapeTransformer = new ShapeTransformer(this.shapeManager);
    this.wsHandler = new WebSocketHandler(socket, roomId, {
      onShapeUpdate: (shape) => this.handleShapeUpdate(shape),
      onShapeDelete: (id) => this.handleShapeDelete(id),
      onClearAll: () => this.handleClearAll(),
    });

    this.init();
    this.initMouseHandlers();
    this.initZoomHandlers();
    this.initKeyboardHandlers();
  }

  // ==================== Lifecycle Methods ====================

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
  }

  async init() {
    this.existingShapes = (await getExistingShapes(this.roomId)) || [];
    this.existingShapes = this.existingShapes.map((s) => {
      if (!(s as any).id) (s as any).id = this.shapeManager.genId();
      return s;
    });
    this.clearCanvas();
  }

  // ==================== Public API ====================

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

  getZoom(): number {
    return this.zoomPanManager.getZoom();
  }

  getShapes(): Shape[] {
    return this.existingShapes;
  }

  setZoom(newZoom: number, centerX?: number, centerY?: number) {
    const oldZoom = this.zoomPanManager.getZoom();
    this.zoomPanManager.setZoom(newZoom);

    // Zoom towards cursor position if provided
    if (centerX !== undefined && centerY !== undefined) {
      const canvasPoint = this.zoomPanManager.screenToCanvas(centerX, centerY);
      const newPanX = centerX - canvasPoint.x * this.zoomPanManager.getZoom();
      const newPanY = centerY - canvasPoint.y * this.zoomPanManager.getZoom();
      this.zoomPanManager.setPan(newPanX, newPanY);
    }

    this.clearCanvas();
  }

  resetView() {
    this.zoomPanManager.resetView();
    this.clearCanvas();
  }

  setPan(x: number, y: number) {
    this.zoomPanManager.setPan(x, y);
    this.clearCanvas();
  }

  clearAllShapes() {
    this.existingShapes = [];
    this.clearCanvas();
    this.wsHandler.sendClearAll();
  }

  // ==================== WebSocket Handlers ====================

  private handleShapeUpdate(shape: Shape) {
    // Validate shape
    if (!shape || !shape.type) {
      console.warn("Received invalid shape:", shape);
      return;
    }

    // Add ID if missing
    if (!(shape as any).id) (shape as any).id = this.shapeManager.genId();

    // Don't process our own updates
    if (this.isDragging && this.draggingShape && (this.draggingShape as any).id === (shape as any).id) {
      return;
    }

    const existingIndex = this.existingShapes.findIndex((s: any) => s.id === (shape as any).id);
    if (existingIndex >= 0) {
      this.existingShapes[existingIndex] = shape;
    } else {
      this.existingShapes.push(shape);
    }
    this.clearCanvas();
  }

  private handleShapeDelete(id: string) {
    const index = this.existingShapes.findIndex((s: any) => s.id === id);
    if (index > -1) {
      this.existingShapes.splice(index, 1);
      this.clearCanvas();
    }
  }

  private handleClearAll() {
    this.existingShapes = [];
    this.clearCanvas();
  }

  // ==================== Canvas Rendering ====================

  clearCanvas() {
    this.renderer.clearCanvas(
      this.existingShapes,
      this.zoomPanManager.getZoom(),
      this.zoomPanManager.getPanX(),
      this.zoomPanManager.getPanY(),
      this.draggingShape
    );
  }

  // ==================== Mouse Event Handlers ====================

  private mouseDownHandler = (e: MouseEvent) => {
    const canvasPos = this.zoomPanManager.screenToCanvas(e.clientX, e.clientY);
    const x = canvasPos.x;
    const y = canvasPos.y;

    // Handle panning (Shift + drag or middle mouse button)
    if (e.shiftKey || e.button === 1) {
      this.zoomPanManager.startPanning(e.clientX, e.clientY);
      this.canvas.style.cursor = "grabbing";
      return;
    }

    // Handle text tool
    if (this.selectedTool === "text") {
      this.handleTextToolClick(x, y);
      return;
    }

    // Handle shape selection with select tool
    if (this.selectedTool === "select") {
      const picked = this.shapeManager.pickShapeAt(x, y, this.existingShapes, this.draggingShape);
      if (picked && picked.shape) {
        this.draggingShape = picked.shape;
        this.startX = x;
        this.startY = y;
        this.isDragging = false;

        if (picked.handleIndex !== null) {
          this.draggingMode = "resize";
          this.resizeHandleIndex = picked.handleIndex;
        } else {
          this.draggingMode = "move";
          this.resizeHandleIndex = null;
          const bb = this.shapeManager.getBoundingBox(picked.shape);
          this.dragOffset = { x: x - bb.x, y: y - bb.y };
        }

        this.clicked = true;
        this.clearCanvas();
        return;
      }

      // Clicked on empty space - deselect
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

  private mouseUpHandler = (e: MouseEvent) => {
    // End panning
    if (this.zoomPanManager.getIsPanning()) {
      this.zoomPanManager.stopPanning();
      this.canvas.style.cursor = "default";
      return;
    }

    // Handle shape selection - keep selected if just clicked (not dragged)
    if (this.draggingShape) {
      if (this.isDragging) {
        this.wsHandler.sendShapeUpdate(this.draggingShape, "update");
      }

      // Keep shape selected if just clicked
      if (!this.isDragging) {
        this.clicked = false;
        this.isDragging = false;
        this.clearCanvas();
        return;
      }

      // Deselect after drag/resize
      this.draggingShape = null;
      this.draggingMode = null;
      this.resizeHandleIndex = null;
      this.isDragging = false;
      this.clicked = false;
      this.clearCanvas();
      return;
    }

    this.clicked = false;

    const canvasPos = this.zoomPanManager.screenToCanvas(e.clientX, e.clientY);
    const shape = this.createShapeFromTool(canvasPos);

    if (!shape) return;

    this.existingShapes.push(shape);
    this.wsHandler.sendShapeUpdate(shape, "chat");

    // Auto-switch to select tool (except for pencil)
    if (this.selectedTool !== "select" && this.selectedTool !== "pencil") {
      this.selectedTool = "select";
      this.draggingShape = shape;
      this.draggingMode = null;
      this.resizeHandleIndex = null;

      if (this.onToolChange) {
        this.onToolChange("select");
      }
    }

    this.clearCanvas();
  };

  private mouseMoveHandler = (e: MouseEvent) => {
    // Handle panning
    if (this.zoomPanManager.getIsPanning()) {
      this.zoomPanManager.updatePanning(e.clientX, e.clientY);
      this.clearCanvas();
      return;
    }

    const canvasPos = this.zoomPanManager.screenToCanvas(e.clientX, e.clientY);
    const x = canvasPos.x;
    const y = canvasPos.y;

    // Handle eraser tool
    if (this.clicked && this.selectedTool === "eraser") {
      const picked = this.shapeManager.pickShapeAt(x, y, this.existingShapes, this.draggingShape);
      if (picked && picked.shape) {
        const shapeToDelete = picked.shape;
        const index = this.existingShapes.indexOf(shapeToDelete);
        if (index > -1) {
          this.existingShapes.splice(index, 1);
          this.clearCanvas();
          this.wsHandler.sendShapeDelete((shapeToDelete as any).id);
        }
      }
      return;
    }

    // Handle shape dragging/resizing
    if (this.clicked && this.draggingShape && this.draggingMode) {
      // Drag threshold - only start dragging if moved > 3 pixels
      if (!this.isDragging) {
        const dx = Math.abs(x - this.startX);
        const dy = Math.abs(y - this.startY);
        const dragThreshold = 3;

        if (dx > dragThreshold || dy > dragThreshold) {
          this.isDragging = true;
        } else {
          return;
        }
      }

      if (this.draggingMode === "move") {
        this.shapeTransformer.moveShape(this.draggingShape, x, y, this.dragOffset.x, this.dragOffset.y);
        this.clearCanvas();
        this.maybeSendUpdate(this.draggingShape);
        return;
      }

      if (this.draggingMode === "resize" && this.resizeHandleIndex !== null) {
        this.shapeTransformer.resizeShape(this.draggingShape, this.resizeHandleIndex, x, y, this.startX, this.startY);
        this.clearCanvas();
        this.maybeSendUpdate(this.draggingShape);
        return;
      }
      return;
    }

    // Handle live preview while drawing
    if (this.clicked) {
      this.drawLivePreview(x, y);
    }
  };

  // ==================== Helper Methods ====================

  private handleTextToolClick(x: number, y: number) {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    const screenPos = this.zoomPanManager.canvasToScreen(x, y);
    input.style.left = screenPos.x + "px";
    input.style.top = screenPos.y + "px";
    input.style.fontSize = "16px";
    input.style.border = "1px solid blue";
    input.style.background = "white";
    input.style.zIndex = "1000";
    document.body.appendChild(input);
    input.focus();
    this.activeTextInput = input;

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const text = input.value.trim();
        if (text) {
          const shape: Shape = {
            id: this.shapeManager.genId(),
            type: "text",
            x,
            y,
            content: text,
          } as any;
          this.existingShapes.push(shape);
          this.wsHandler.sendShapeUpdate(shape, "chat");

          // Auto-switch to select tool
          this.selectedTool = "select";
          this.draggingShape = shape;
          this.draggingMode = null;
          this.resizeHandleIndex = null;

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
  }

  private createShapeFromTool(canvasPos: { x: number; y: number }): Shape | null {
    const width = canvasPos.x - this.startX;
    const height = canvasPos.y - this.startY;
    const selectedTool = this.selectedTool;

    if (selectedTool === "rect") {
      return { id: this.shapeManager.genId(), type: "rect", x: this.startX, y: this.startY, width, height } as any;
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      return {
        id: this.shapeManager.genId(),
        type: "circle",
        centerX: this.startX + radius,
        centerY: this.startY + radius,
        radius: Math.abs(radius),
      } as any;
    } else if (selectedTool === "line") {
      return {
        id: this.shapeManager.genId(),
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX: canvasPos.x,
        endY: canvasPos.y,
      } as any;
    } else if (selectedTool === "arrow") {
      return {
        id: this.shapeManager.genId(),
        type: "arrow",
        startX: this.startX,
        startY: this.startY,
        endX: canvasPos.x,
        endY: canvasPos.y,
      } as any;
    } else if (selectedTool === "diamond") {
      return { id: this.shapeManager.genId(), type: "diamond", x: this.startX, y: this.startY, width, height } as any;
    } else if (selectedTool === "pencil" && this.currentPath.length > 0) {
      const shape = { id: this.shapeManager.genId(), type: "pencil", points: this.currentPath } as any;
      this.currentPath = [];
      return shape;
    }

    return null;
  }

  private drawLivePreview(x: number, y: number) {
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

  // ==================== Event Handler Initialization ====================

  private initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  private wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    const newZoom = this.zoomPanManager.getZoom() * (1 + delta);
    this.setZoom(newZoom, e.clientX, e.clientY);
  };

  private initZoomHandlers() {
    this.canvas.addEventListener("wheel", this.wheelHandler, { passive: false });
  }

  private initKeyboardHandlers() {
    window.addEventListener("keydown", (e) => {
      // Reset zoom shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        this.resetView();
      }

      // Delete selected shape
      if ((e.key === "Delete" || e.key === "Backspace") && this.draggingShape) {
        e.preventDefault();
        const shapeToDelete = this.draggingShape;
        const index = this.existingShapes.indexOf(shapeToDelete);

        if (index > -1) {
          this.existingShapes.splice(index, 1);
          this.draggingShape = null;
          this.draggingMode = null;
          this.resizeHandleIndex = null;
          this.clearCanvas();
          this.wsHandler.sendShapeDelete((shapeToDelete as any).id);
        }
      }
    });
  }

  // ==================== Network Helpers ====================

  private maybeSendUpdate(shape: Shape) {
    const now = Date.now();
    if (now - this.lastSentAt > 50) {
      this.wsHandler.sendShapeUpdate(shape, "update");
      this.lastSentAt = now;
    }
  }
}

import { Shape } from "../TypeShape";

/**
 * Handles all canvas rendering operations
 */
export class DrawingRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Clear and redraw the entire canvas with zoom/pan applied
   */
  clearCanvas(
    shapes: Shape[],
    zoom: number,
    panX: number,
    panY: number,
    selectedShape: Shape | null = null
  ) {
    // Clear and reset transform
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply zoom and pan transform
    this.ctx.translate(panX, panY);
    this.ctx.scale(zoom, zoom);

    // Draw all shapes
    shapes.forEach((shape) => {
      this.ctx.strokeStyle = "rgba(255, 255, 255)";
      this.ctx.fillStyle = "white";
      this.drawShape(shape);
    });

    // Draw handles for selected shape
    if (selectedShape) {
      this.drawHandles(selectedShape);
    }
  }

  /**
   * Draw a single shape on the canvas
   */
  drawShape(shape: Shape) {
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
      this.ctx.closePath();

      const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
      const headLen = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(shape.endX, shape.endY);
      this.ctx.lineTo(
        shape.endX - headLen * Math.cos(angle - Math.PI / 6),
        shape.endY - headLen * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.moveTo(shape.endX, shape.endY);
      this.ctx.lineTo(
        shape.endX - headLen * Math.cos(angle + Math.PI / 6),
        shape.endY - headLen * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "diamond") {
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, shape.y);
      this.ctx.lineTo(shape.x + shape.width, cy);
      this.ctx.lineTo(cx, shape.y + shape.height);
      this.ctx.lineTo(shape.x, cy);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (shape.type === "text") {
      this.ctx.font = "16px Arial";
      this.ctx.fillText(shape.content, shape.x, shape.y);
    }
  }

  /**
   * Draw resize handles around a selected shape
   */
  drawHandles(shape: Shape) {
    const handles = this.getHandlesForShape(shape);
    this.ctx.fillStyle = "blue";
    handles.forEach((h) => {
      this.ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
    });
  }

  /**
   * Get handle positions for a shape (8 handles around bounding box)
   */
  private getHandlesForShape(shape: Shape): Array<{ x: number; y: number }> {
    const bb = this.getBoundingBox(shape);
    const { x, y, width, height } = bb;
    return [
      { x, y },
      { x: x + width / 2, y },
      { x: x + width, y },
      { x: x + width, y: y + height / 2 },
      { x: x + width, y: y + height },
      { x: x + width / 2, y: y + height },
      { x, y: y + height },
      { x, y: y + height / 2 },
    ];
  }

  /**
   * Get bounding box for any shape type
   */
  private getBoundingBox(shape: Shape): { x: number; y: number; width: number; height: number } {
    if (shape.type === "rect" || shape.type === "diamond") {
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    } else if (shape.type === "circle") {
      return {
        x: shape.centerX - shape.radius,
        y: shape.centerY - shape.radius,
        width: shape.radius * 2,
        height: shape.radius * 2,
      };
    } else if (shape.type === "line" || shape.type === "arrow") {
      const x = Math.min(shape.startX, shape.endX);
      const y = Math.min(shape.startY, shape.endY);
      const width = Math.abs(shape.endX - shape.startX);
      const height = Math.abs(shape.endY - shape.startY);
      return { x, y, width, height };
    } else if (shape.type === "pencil") {
      const xs = shape.points.map((p) => p.x);
      const ys = shape.points.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } else if (shape.type === "text") {
      return { x: shape.x, y: shape.y - 16, width: 100, height: 20 };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  }
}

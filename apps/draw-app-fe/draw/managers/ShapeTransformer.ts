import { Shape } from "../TypeShape";
import { ShapeManager } from "./ShapeManager";

/**
 * Handles shape transformation operations (move, resize)
 */
export class ShapeTransformer {
  private shapeManager: ShapeManager;

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }

  /**
   * Move a shape by the given offset
   */
  moveShape(shape: Shape, targetX: number, targetY: number, dragOffsetX: number, dragOffsetY: number) {
    const bb = this.shapeManager.getBoundingBox(shape);
    const actualTargetX = targetX - dragOffsetX;
    const actualTargetY = targetY - dragOffsetY;
    const dx = actualTargetX - bb.x;
    const dy = actualTargetY - bb.y;

    if (shape.type === "rect" || shape.type === "diamond") {
      shape.x = actualTargetX;
      shape.y = actualTargetY;
    } else if (shape.type === "circle") {
      shape.centerX += dx;
      shape.centerY += dy;
    } else if (shape.type === "line" || shape.type === "arrow") {
      shape.startX += dx;
      shape.startY += dy;
      shape.endX += dx;
      shape.endY += dy;
    } else if (shape.type === "pencil") {
      for (let i = 0; i < shape.points.length; i++) {
        shape.points[i].x += dx;
        shape.points[i].y += dy;
      }
    } else if (shape.type === "text") {
      shape.x += dx;
      shape.y += dy;
    }
  }

  /**
   * Resize a shape based on handle index and new position
   */
  resizeShape(shape: Shape, handleIndex: number, x: number, y: number, startX: number, startY: number) {
    if (shape.type === "rect" || shape.type === "diamond") {
      const bb = this.shapeManager.getBoundingBox(shape);
      let { x: bx, y: by, width: bw, height: bh } = bb;

      switch (handleIndex) {
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
      shape.x = bx;
      shape.y = by;
      shape.width = bw;
      shape.height = bh;
    } else if (shape.type === "circle") {
      const center = { x: shape.centerX, y: shape.centerY };
      const newR = Math.max(2, Math.hypot(x - center.x, y - center.y));
      shape.radius = newR;
    } else if (shape.type === "line" || shape.type === "arrow") {
      if (handleIndex === 0) {
        shape.startX = x;
        shape.startY = y;
      } else if (handleIndex === 1) {
        shape.endX = x;
        shape.endY = y;
      }
    } else if (shape.type === "text") {
      const currentSize = (shape as any).fontSize || 16;
      const delta = y - startY;
      const newSize = Math.max(8, Math.round(currentSize + delta * 0.05));
      (shape as any).fontSize = newSize;
    } else if (shape.type === "pencil") {
      if (handleIndex >= 0 && handleIndex < shape.points.length) {
        shape.points[handleIndex].x = x;
        shape.points[handleIndex].y = y;
      }
    }
  }
}

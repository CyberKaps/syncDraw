import { Shape } from "../TypeShape";

/**
 * Handles shape manipulation, selection, and geometric calculations
 */
export class ShapeManager {
  /**
   * Generate a unique ID for shapes
   */
  genId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Check if two points are near each other within tolerance
   */
  pointNear(a: { x: number; y: number }, b: { x: number; y: number }, tolerance = 8): boolean {
    return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
  }

  /**
   * Get bounding box for any shape type
   */
  getBoundingBox(shape: Shape): { x: number; y: number; width: number; height: number } {
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

  /**
   * Get handle positions for a shape (8 handles around bounding box)
   */
  getHandlesForShape(shape: Shape): Array<{ x: number; y: number }> {
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
   * Pick a shape at the given coordinates, checking handles first then shape body
   */
  pickShapeAt(
    x: number,
    y: number,
    shapes: Shape[],
    selectedShape: Shape | null
  ): { shape: Shape; handleIndex: number | null } | null {
    // Check handles of selected shape first
    if (selectedShape) {
      const handles = this.getHandlesForShape(selectedShape);
      for (let i = 0; i < handles.length; i++) {
        if (this.pointNear({ x, y }, handles[i], 8)) {
          return { shape: selectedShape, handleIndex: i };
        }
      }
    }

    // Check all shapes (reverse order to pick topmost first)
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (this.isPointInShape(shape, x, y)) {
        return { shape, handleIndex: null };
      }
    }

    return null;
  }

  /**
   * Check if a point is inside a shape
   */
  private isPointInShape(shape: Shape, x: number, y: number): boolean {
    if (shape.type === "rect") {
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    } else if (shape.type === "circle") {
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      return dx * dx + dy * dy <= shape.radius * shape.radius;
    } else if (shape.type === "line" || shape.type === "arrow") {
      return this.pointNearPointToSegment(
        { x, y },
        { x: shape.startX, y: shape.startY },
        { x: shape.endX, y: shape.endY },
        6
      );
    } else if (shape.type === "pencil") {
      const points = shape.points;
      for (let i = 0; i < points.length - 1; i++) {
        if (this.pointNearPointToSegment({ x, y }, points[i], points[i + 1], 6)) {
          return true;
        }
      }
      return false;
    } else if (shape.type === "diamond") {
      const bb = this.getBoundingBox(shape);
      return (
        x >= bb.x &&
        x <= bb.x + bb.width &&
        y >= bb.y &&
        y <= bb.y + bb.height
      );
    } else if (shape.type === "text") {
      const bb = this.getBoundingBox(shape);
      return (
        x >= bb.x &&
        x <= bb.x + bb.width &&
        y >= bb.y &&
        y <= bb.y + bb.height
      );
    }
    return false;
  }

  /**
   * Check if a point is near a line segment
   */
  private pointNearPointToSegment(
    p: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
    tol = 6
  ): boolean {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return this.pointNear(p, a, tol);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const closestX = a.x + t * dx;
    const closestY = a.y + t * dy;
    return this.pointNear(p, { x: closestX, y: closestY }, tol);
  }
}

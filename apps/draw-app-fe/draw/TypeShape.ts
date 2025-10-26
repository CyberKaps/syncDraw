
export type Shape = {
    type: "rect";
    id?: string;
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    id?: string;
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    id?: string;
    points: Array<{x: number, y: number}>;
} | {
      type: "line";
      id?: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "arrow";
      id?: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "diamond";
      id?: string;
      x: number;
      y: number;
      width: number;
      height: number;
    } | {
      type: "text";
      id?: string;
      x: number;
      y: number;
      content: string;
    };
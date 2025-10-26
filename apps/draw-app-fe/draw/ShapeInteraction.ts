// import { Shape } from "./TypeShape";

// export class ShapeInteraction {
//   private shapes: Shape[];
//   private ctx: CanvasRenderingContext2D;
//   private socket: WebSocket;
//   private roomId: string;
//   private draggingShape: Shape | null = null;
//   private offsetX = 0;
//   private offsetY = 0;

//   constructor(
//     shapes: Shape[],
//     ctx: CanvasRenderingContext2D,
//     socket: WebSocket,
//     roomId: string
//   ) {
//     this.shapes = shapes;
//     this.ctx = ctx;
//     this.socket = socket;
//     this.roomId = roomId;
//   }

//   mouseDown(x: number, y: number) {
//     // detect if click is inside any shape
//     for (let i = this.shapes.length - 1; i >= 0; i--) {
//       const shape = this.shapes[i];
//       if (this.isInsideShape(x, y, shape)) {
//         this.draggingShape = shape;

//         // calculate offset for dragging
//         if (shape.type === "rect" || shape.type === "diamond" || shape.type === "text") {
//           this.offsetX = x - shape.x;
//           this.offsetY = y - shape.y;
//         } else if (shape.type === "circle") {
//           this.offsetX = x - shape.centerX;
//           this.offsetY = y - shape.centerY;
//         } else if (shape.type === "line" || shape.type === "arrow") {
//           this.offsetX = x - shape.startX;
//           this.offsetY = y - shape.startY;
//         }
//         return;
//       }
//     }
//   }

//   mouseMove(x: number, y: number): boolean {
//     if (!this.draggingShape) return false;

//     const shape = this.draggingShape;

//     if (shape.type === "rect" || shape.type === "diamond" || shape.type === "text") {
//       shape.x = x - this.offsetX;
//       shape.y = y - this.offsetY;
//     } else if (shape.type === "circle") {
//       shape.centerX = x - this.offsetX;
//       shape.centerY = y - this.offsetY;
//     } else if (shape.type === "line" || shape.type === "arrow") {
//       const dx = x - this.offsetX - shape.startX;
//       const dy = y - this.offsetY - shape.startY;
//       shape.startX += dx;
//       shape.startY += dy;
//       shape.endX += dx;
//       shape.endY += dy;
//     }

//     return true;
//   }

//   mouseUp() {
//     if (!this.draggingShape) return;

//     // send shape update via websocket
//     this.socket.send(
//       JSON.stringify({
//         type: "chat",
//         message: JSON.stringify({ shape: this.draggingShape }),
//         roomId: this.roomId,
//       })
//     );

//     this.draggingShape = null;
//   }

//   private isInsideShape(x: number, y: number, shape: Shape): boolean {
//     switch (shape.type) {
//       case "rect":
//       case "diamond":
//       case "text":
//         return (
//           x >= shape.x &&
//           x <= shape.x + shape.width &&
//           y >= shape.y &&
//           y <= shape.y + shape.height
//         );
//       case "circle":
//         const dx = x - shape.centerX;
//         const dy = y - shape.centerY;
//         return dx * dx + dy * dy <= shape.radius * shape.radius;
//       case "line":
//       case "arrow":
//         const { startX, startY, endX, endY } = shape;
//         const distToLine =
//           Math.abs(
//             (endY - startY) * x - (endX - startX) * y + endX * startY - endY * startX
//           ) /
//           Math.sqrt((endY - startY) ** 2 + (endX - startX) ** 2);
//         return distToLine < 8; // threshold for clicking near line
//       default:
//         return false;
//     }
//   }
// }

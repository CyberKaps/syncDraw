import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { Shape } from "./TypeShape";


export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private currentPath: Array<{x: number, y: number}> = [];
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";

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
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: "circle" | "pencil" | "rect" | "line" | "arrow" | "diamond" | "text") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.map((shape) => {
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
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
                    for (let i = 1; i < points.length; i++) {
                        this.ctx.lineTo(points[i].x, points[i].y);
                    }
                }
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (shape.type === "arrow") {
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
            }
            else if (shape.type === "diamond") {
                const centerX = shape.x + shape.width / 2;
                const centerY = shape.y + shape.height / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, shape.y);
                this.ctx.lineTo(shape.x + shape.width, centerY);
                this.ctx.lineTo(centerX, shape.y + shape.height);
                this.ctx.lineTo(shape.x, centerY);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        })
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        if (this.selectedTool === "pencil") {
            this.currentPath = [{x: e.clientX, y: e.clientY}];
        }
    }
    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        
        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
            }
        } else if (selectedTool === "pencil" && this.currentPath.length > 0) {
            shape = {
                type: "pencil",
                points: [...this.currentPath]
            }
            this.currentPath = [];
        } else if (selectedTool === "line") {
            shape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            };
        }
        else if (selectedTool === "arrow") {
            shape = {
                type: "arrow",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            };
        }
        else if (selectedTool === "diamond") {
            shape = {
                type: "diamond",
                x: this.startX,
                y: this.startY,
                width,
                height
            };
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }
    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
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
                this.currentPath.push({x: e.clientX, y: e.clientY});
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
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (selectedTool === "arrow") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();

                // Draw arrowhead
                const angle = Math.atan2(e.clientY - this.startY, e.clientX - this.startX);
                const headLength = 10;
                this.ctx.beginPath();
                this.ctx.moveTo(e.clientX, e.clientY);
                this.ctx.lineTo(
                    e.clientX - headLength * Math.cos(angle - Math.PI / 6),
                    e.clientY - headLength * Math.sin(angle - Math.PI / 6)
                );
                this.ctx.moveTo(e.clientX, e.clientY);
                this.ctx.lineTo(
                    e.clientX - headLength * Math.cos(angle + Math.PI / 6),
                    e.clientY - headLength * Math.sin(angle + Math.PI / 6)
                );
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (selectedTool === "diamond") {
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
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    

    }
}
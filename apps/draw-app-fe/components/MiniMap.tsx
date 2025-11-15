"use client";

import { useEffect, useRef } from "react";
import { Shape } from "@/draw/TypeShape";

interface MiniMapProps {
    shapes: Shape[];
    canvasWidth: number;
    canvasHeight: number;
    zoom: number;
    panX: number;
    panY: number;
    onNavigate?: (x: number, y: number) => void;
}

export function MiniMap({ 
    shapes, 
    canvasWidth, 
    canvasHeight, 
    zoom, 
    panX, 
    panY,
    onNavigate 
}: MiniMapProps) {
    const miniMapRef = useRef<HTMLCanvasElement>(null);
    const miniMapSize = 200;
    const scale = 0.1; // Mini map is 10% of actual canvas

    useEffect(() => {
        const canvas = miniMapRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, miniMapSize, miniMapSize);
        ctx.fillStyle = "rgba(30, 30, 30, 0.8)";
        ctx.fillRect(0, 0, miniMapSize, miniMapSize);

        // Draw all shapes (simplified)
        ctx.save();
        ctx.scale(scale, scale);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;

        // Filter out invalid shapes before rendering
        shapes.filter(shape => shape && shape.type).forEach((shape) => {
            drawShapeOnMiniMap(ctx, shape);
        });

        ctx.restore();

        // Draw viewport indicator
        const viewportX = (-panX / zoom) * scale;
        const viewportY = (-panY / zoom) * scale;
        const viewportWidth = (canvasWidth / zoom) * scale;
        const viewportHeight = (canvasHeight / zoom) * scale;

        ctx.strokeStyle = "rgba(59, 130, 246, 0.8)"; // Blue
        ctx.lineWidth = 2;
        ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);

    }, [shapes, zoom, panX, panY, canvasWidth, canvasHeight]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onNavigate) return;
        
        const rect = miniMapRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert minimap coordinates to canvas coordinates
        const canvasX = (x / scale) * zoom - canvasWidth / 2;
        const canvasY = (y / scale) * zoom - canvasHeight / 2;

        onNavigate(-canvasX, -canvasY);
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <div className="relative">
                {/* Title */}
                <div className="absolute -top-8 left-0 right-0 text-center">
                    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-t-xl shadow-lg border border-gray-700/50 border-b-0 inline-block">
                        <span className="font-medium">Overview</span>
                    </div>
                </div>
                
                {/* MiniMap Canvas */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-200">
                    <canvas
                        ref={miniMapRef}
                        width={miniMapSize}
                        height={miniMapSize}
                        onClick={handleClick}
                        className="cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}

function drawShapeOnMiniMap(ctx: CanvasRenderingContext2D, shape: Shape) {
    ctx.beginPath();
    
    if (shape.type === "rect") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
        ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
        ctx.stroke();
    } else if (shape.type === "pencil") {
        const points = shape.points;
        if (points.length > 0) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        }
    } else if (shape.type === "line") {
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
    } else if (shape.type === "arrow") {
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
    } else if (shape.type === "diamond") {
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        ctx.moveTo(centerX, shape.y);
        ctx.lineTo(shape.x + shape.width, centerY);
        ctx.lineTo(centerX, shape.y + shape.height);
        ctx.lineTo(shape.x, centerY);
        ctx.closePath();
        ctx.stroke();
    } else if (shape.type === "text") {
        // Just draw a small rectangle for text in minimap
        ctx.fillRect(shape.x, shape.y, 10, 10);
    }
    
    ctx.closePath();
}

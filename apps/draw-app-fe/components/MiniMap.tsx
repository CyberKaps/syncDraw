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
        ctx.fillStyle = "rgba(3, 3, 3, 0.8)";
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

        ctx.strokeStyle = "rgba(99, 102, 241, 0.8)"; // Indigo
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
        <div className="fixed bottom-6 left-6 z-50 pointer-events-none animate-fade-in-up animation-delay-300">
            <div className="relative pointer-events-auto group">
                {/* Title */}
                <div className="absolute -top-8 left-0 right-0 text-center transition-transform group-hover:-translate-y-1">
                    <div className="bg-zinc-900/80 backdrop-blur-xl text-zinc-300 text-xs px-4 py-1.5 rounded-t-xl shadow-lg border border-white/10 border-b-0 inline-block font-medium tracking-wide">
                        Overview
                    </div>
                </div>
                
                {/* MiniMap Canvas */}
                <div className="bg-zinc-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]">
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

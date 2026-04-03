import { useEffect, useRef, useState } from "react";
import { Circle, Pencil, RectangleHorizontalIcon, ArrowUpRight, Diamond, Minus, Type, MousePointer2, Home, Eraser, ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import { Game } from "@/draw/Game";
import { useRouter } from "next/navigation";
import { MiniMap } from "./MiniMap";
import { Shape } from "@/draw/TypeShape";

export type Tool = "circle" | "pencil" | "rect" | "line" | "arrow" | "diamond" | "text" | "select" | "eraser";

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    const [zoom, setZoom] = useState(1);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const router = useRouter();

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            // Set callback for tool changes from Game
            g.setToolChangeCallback((tool) => {
                setSelectedTool(tool);
            });

            // Update shapes periodically for mini-map
            const interval = setInterval(() => {
                setShapes([...g.getShapes()]);
            }, 500);

            return () => {
                clearInterval(interval);
                g.destroy();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef]);

    const handleGoHome = () => {
        if (confirm("Are you sure you want to leave this room?")) {
            router.push("/");
        }
    };

    const handleZoomIn = () => {
        if (game) {
            const newZoom = Math.min(5, game.getZoom() * 1.2);
            game.setZoom(newZoom);
            setZoom(newZoom);
        }
    };

    const handleZoomOut = () => {
        if (game) {
            const newZoom = Math.max(0.1, game.getZoom() / 1.2);
            game.setZoom(newZoom);
            setZoom(newZoom);
        }
    };

    const handleResetZoom = () => {
        if (game) {
            game.resetView();
            setZoom(1);
            setPanX(0);
            setPanY(0);
        }
    };

    const handleMiniMapNavigate = (x: number, y: number) => {
        if (game) {
            game.setPan(x, y);
            setPanX(x);
            setPanY(y);
        }
    };

    const handleClearAll = () => {
        if (confirm("Are you sure you want to clear all drawings? This action cannot be undone.")) {
            if (game) {
                game.clearAllShapes();
                setShapes([]);
            }
        }
    };

    return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar 
            setSelectedTool={setSelectedTool} 
            selectedTool={selectedTool} 
            onGoHome={handleGoHome}
            onClearAll={handleClearAll}
        />
        <ZoomControls 
            zoom={zoom} 
            onZoomIn={handleZoomIn} 
            onZoomOut={handleZoomOut} 
            onReset={handleResetZoom}
        />
        <MiniMap 
            shapes={shapes}
            canvasWidth={window.innerWidth}
            canvasHeight={window.innerHeight}
            zoom={zoom}
            panX={panX}
            panY={panY}
            onNavigate={handleMiniMapNavigate}
        />
    </div>
}

function Topbar({selectedTool, setSelectedTool, onGoHome, onClearAll}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    onGoHome: () => void,
    onClearAll: () => void
}) {
    const tools = [
        { id: "select" as Tool, icon: <MousePointer2 />, label: "Select", group: "basic" },
        { id: "pencil" as Tool, icon: <Pencil />, label: "Pencil", group: "draw" },
        { id: "eraser" as Tool, icon: <Eraser />, label: "Eraser", group: "draw" },
        { id: "line" as Tool, icon: <Minus />, label: "Line", group: "shapes" },
        { id: "arrow" as Tool, icon: <ArrowUpRight />, label: "Arrow", group: "shapes" },
        { id: "rect" as Tool, icon: <RectangleHorizontalIcon />, label: "Rectangle", group: "shapes" },
        { id: "circle" as Tool, icon: <Circle />, label: "Circle", group: "shapes" },
        { id: "diamond" as Tool, icon: <Diamond />, label: "Diamond", group: "shapes" },
        { id: "text" as Tool, icon: <Type />, label: "Text", group: "basic" }
    ];

    const basicTools = tools.filter(t => t.group === "basic");
    const drawTools = tools.filter(t => t.group === "draw");
    const shapeTools = tools.filter(t => t.group === "shapes");

    return (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
            <div className="flex justify-between items-start p-4 pointer-events-auto">
                {/* Left side - Drawing tools */}
                <div className="flex flex-col gap-3">
                    {/* Main toolbar */}
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-3">
                        <div className="flex items-center gap-2">
                            {/* Basic Tools */}
                            <div className="flex gap-1">
                                {basicTools.map((tool) => (
                                    <ToolButton
                                        key={tool.id}
                                        icon={tool.icon}
                                        label={tool.label}
                                        isActive={selectedTool === tool.id}
                                        onClick={() => setSelectedTool(tool.id)}
                                    />
                                ))}
                            </div>

                            <div className="w-px h-8 bg-gray-700"></div>

                            {/* Draw Tools */}
                            <div className="flex gap-1">
                                {drawTools.map((tool) => (
                                    <ToolButton
                                        key={tool.id}
                                        icon={tool.icon}
                                        label={tool.label}
                                        isActive={selectedTool === tool.id}
                                        onClick={() => setSelectedTool(tool.id)}
                                    />
                                ))}
                            </div>

                            <div className="w-px h-8 bg-gray-700"></div>

                            {/* Shape Tools */}
                            <div className="flex gap-1">
                                {shapeTools.map((tool) => (
                                    <ToolButton
                                        key={tool.id}
                                        icon={tool.icon}
                                        label={tool.label}
                                        isActive={selectedTool === tool.id}
                                        onClick={() => setSelectedTool(tool.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active tool indicator */}
                    {/* <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-700/50">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-sm font-medium">
                                {tools.find(t => t.id === selectedTool)?.label || "Select Tool"}
                            </span>
                        </div>
                    </div> */}
                </div>

                {/* Right side - Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClearAll}
                        className="bg-gradient-to-br from-orange-600 to-orange-700 text-white px-5 py-3 rounded-xl hover:from-orange-500 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 shadow-xl border border-orange-500/30 hover:shadow-orange-500/20 hover:scale-105"
                        title="Clear all drawings"
                    >
                        <Trash2 className="h-5 w-5" />
                        <span className="hidden sm:inline font-medium">Clear All</span>
                    </button>
                    
                    <button
                        onClick={onGoHome}
                        className="bg-gradient-to-br from-red-600 to-red-700 text-white px-5 py-3 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 flex items-center gap-2 shadow-xl border border-red-500/30 hover:shadow-red-500/20 hover:scale-105"
                    >
                        <Home className="h-5 w-5" />
                        <span className="hidden sm:inline font-medium">Exit Room</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ToolButton({ icon, label, isActive, onClick }: {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                group relative p-3 rounded-xl transition-all duration-200
                ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105'
                }
            `}
            title={label}
        >
            <div className="w-5 h-5 flex items-center justify-center">
                {icon}
            </div>
            
            {/* Tooltip */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-gray-700">
                    {label}
                </div>
            </div>
        </button>
    );
}

function ZoomControls({ 
    zoom, 
    onZoomIn, 
    onZoomOut, 
    onReset 
}: { 
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {/* Zoom controls */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-2">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onZoomIn}
                        className="bg-gray-800/50 text-white p-3 rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:scale-105 group"
                        title="Zoom In (Scroll Up)"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>
                    
                    <button
                        onClick={onReset}
                        className="bg-gray-800/50 text-white px-3 py-2 rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 text-sm font-mono font-bold hover:scale-105"
                        title="Reset Zoom (Ctrl+0)"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    
                    <button
                        onClick={onZoomOut}
                        className="bg-gray-800/50 text-white p-3 rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:scale-105 group"
                        title="Zoom Out (Scroll Down)"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </button>
                    
                    <div className="border-t border-gray-700 my-1"></div>
                    
                    <button
                        onClick={onReset}
                        className="bg-gray-800/50 text-white p-3 rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:scale-105 group"
                        title="Fit to Screen"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
            
            {/* Pan hint */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-gray-700/50">
                <div className="text-center font-medium">
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-0.5 bg-gray-700 rounded text-[10px]">Shift</kbd>
                        <span>+ Drag to Pan</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { Circle, Pencil, RectangleHorizontalIcon, ArrowUpRight, Diamond, Minus, Type, MousePointer2, Home, Eraser, ZoomIn, ZoomOut, Maximize2, Trash2, Palette } from "lucide-react";
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

    return <div className="bg-[#030303] selection:bg-indigo-500/30 font-sans" style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative"
    }}>
        {/* Subtle ambient lighting */}
        <div className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-50">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen" />
        </div>

        {/* Grid Background applied underneath canvas, assuming canvas handles its own rendering and is transparent, 
            if canvas isn't transparent, it will cover this. */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="relative z-10"></canvas>
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
        <div className="relative z-50">
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
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none animate-fade-in-up">
            <div className="flex justify-between items-start p-6 pointer-events-auto">
                {/* Logo / Brand */}
                <div className="hidden md:flex items-center gap-3 bg-zinc-900/60 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Palette className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
                        syncDraw
                    </span>
                </div>

                {/* Left side - Drawing tools (Centered practically) */}
                <div className="flex flex-col gap-3 mx-auto">
                    {/* Main toolbar */}
                    <div className="bg-zinc-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-2 transform transition-all duration-300 hover:shadow-indigo-500/10">
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

                            <div className="w-px h-8 bg-white/10"></div>

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

                            <div className="w-px h-8 bg-white/10"></div>

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
                </div>

                {/* Right side - Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClearAll}
                        className="bg-zinc-900/60 text-white px-5 py-3 rounded-2xl hover:bg-zinc-800 transition-all duration-300 flex items-center gap-2 shadow-xl border border-white/10 hover:border-orange-500/50 hover:text-orange-400 hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] hover:scale-105 backdrop-blur-xl"
                        title="Clear all drawings"
                    >
                        <Trash2 className="h-5 w-5" />
                        <span className="hidden sm:inline font-semibold">Clear</span>
                    </button>
                    
                    <button
                        onClick={onGoHome}
                        className="bg-white/10 text-white px-5 py-3 rounded-2xl hover:bg-red-600 transition-all duration-300 flex items-center gap-2 shadow-xl border border-white/10 hover:border-red-500/50 hover:shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] hover:scale-105 backdrop-blur-xl font-semibold"
                    >
                        <Home className="h-5 w-5" />
                        <span className="hidden sm:inline">Exit</span>
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
                group relative p-3 rounded-xl transition-all duration-300
                ${isActive 
                    ? 'bg-indigo-600/20 text-indigo-400 shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)] border border-indigo-500/50 scale-105' 
                    : 'bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white hover:scale-105 border border-transparent'
                }
            `}
            title={label}
        >
            <div className="w-5 h-5 flex items-center justify-center">
                {icon}
            </div>
            
            {/* Tooltip */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-white/10 font-medium">
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none animate-fade-in-up animation-delay-200">
            {/* Zoom controls */}
            <div className="bg-zinc-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-2 pointer-events-auto">
                <div className="flex flex-col gap-1">
                    <button
                        onClick={onZoomIn}
                        className="text-zinc-400 p-3 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200 hover:scale-105"
                        title="Zoom In (Scroll Up)"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>
                    
                    <button
                        onClick={onReset}
                        className="text-indigo-400 px-3 py-2 rounded-xl hover:bg-indigo-500/10 transition-all duration-200 text-xs font-mono font-bold hover:scale-105 border border-transparent hover:border-indigo-500/30"
                        title="Reset Zoom (Ctrl+0)"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    
                    <button
                        onClick={onZoomOut}
                        className="text-zinc-400 p-3 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200 hover:scale-105"
                        title="Zoom Out (Scroll Down)"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </button>
                    
                    <div className="border-t border-white/10 my-1 mx-2"></div>
                    
                    <button
                        onClick={onReset}
                        className="text-zinc-400 p-3 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200 hover:scale-105"
                        title="Fit to Screen"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
            
            {/* Pan hint */}
            <div className="bg-zinc-900/80 backdrop-blur-xl text-zinc-300 text-xs px-3 py-2.5 rounded-xl shadow-lg border border-white/10 pointer-events-auto transition-transform hover:scale-105">
                <div className="text-center font-medium">
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-mono border border-white/5 shadow-inner">Shift</kbd>
                        <span>+ Drag to Pan</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


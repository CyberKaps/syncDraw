import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, ArrowUpRight, Diamond, Minus, Type, MousePointer2, Home, Eraser, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
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

            // Update shapes periodically for mini-map
            const interval = setInterval(() => {
                setShapes([...g.getShapes()]);
            }, 500);

            return () => {
                clearInterval(interval);
                g.destroy();
            }
        }
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

    return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} onGoHome={handleGoHome} />
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

function Topbar({selectedTool, setSelectedTool, onGoHome}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    onGoHome: () => void
}) {
    return <div style={{
            position: "fixed",
            top: 10,
            left: 10,
            right: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <div className="flex gap-4">
                <IconButton 
                    onClick={() => {
                        setSelectedTool("pencil")
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton 
                    onClick={() => setSelectedTool("eraser")}
                    activated={selectedTool === "eraser"}
                    icon={<Eraser />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>

                <IconButton onClick={() => setSelectedTool("line")} activated={selectedTool === "line"} icon={<Minus />} />
                <IconButton onClick={() => setSelectedTool("arrow")} activated={selectedTool === "arrow"} icon={<ArrowUpRight />} />
                <IconButton onClick={() => setSelectedTool("diamond")} activated={selectedTool === "diamond"} icon={<Diamond />} />
                <IconButton
                    onClick={() => setSelectedTool("text")}
                    activated={selectedTool === "text"}
                    icon={<Type />}
                />
                <IconButton
                    onClick={() => setSelectedTool("select")}
                    activated={selectedTool === "select"}
                    icon={<MousePointer2 />}
                />
            </div>
            
            <button
                onClick={onGoHome}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg"
            >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
            </button>
        </div>
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
        <div style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center"
        }}>
            <div className="bg-gray-900 rounded-lg shadow-lg p-2 flex flex-col gap-2">
                <button
                    onClick={onZoomIn}
                    className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition-colors"
                    title="Zoom In (Scroll Up)"
                >
                    <ZoomIn className="h-5 w-5" />
                </button>
                
                <button
                    onClick={onReset}
                    className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors text-sm font-mono"
                    title="Reset Zoom (Ctrl+0)"
                >
                    {Math.round(zoom * 100)}%
                </button>
                
                <button
                    onClick={onZoomOut}
                    className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition-colors"
                    title="Zoom Out (Scroll Down)"
                >
                    <ZoomOut className="h-5 w-5" />
                </button>
                
                <div className="border-t border-gray-700 my-1"></div>
                
                <button
                    onClick={onReset}
                    className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition-colors"
                    title="Fit to Screen"
                >
                    <Maximize2 className="h-5 w-5" />
                </button>
            </div>
            
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                <div className="text-center font-mono">Pan: Shift+Drag</div>
            </div>
        </div>
    );
}

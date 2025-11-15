

import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, ArrowUpRight, Diamond, Minus, Type, MousePointer2, Home, Eraser } from "lucide-react";
import { Game } from "@/draw/Game";
import { useRouter } from "next/navigation";

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
    const [selectedTool, setSelectedTool] = useState<Tool>("circle")
    const router = useRouter();

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {

        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }


    }, [canvasRef]);

    const handleGoHome = () => {
        if (confirm("Are you sure you want to leave this room?")) {
            router.push("/");
        }
    };

    return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} onGoHome={handleGoHome} />
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

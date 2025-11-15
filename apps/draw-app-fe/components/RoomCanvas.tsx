"use client";

import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";


export function RoomCanvas({roomId}: {
    roomId: string
}) {
    
    const [socket, setSocket] = useState<WebSocket | null > (null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        // Small delay to ensure localStorage is ready after navigation
        const initTimeout = setTimeout(() => {
            const token = localStorage.getItem("token");
            
            if (!token) {
                setError("Please sign in first");
                setIsConnecting(false);
                router.push("/signin");
                return;
            }

            // Prevent creating multiple connections
            if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
                return;
            }

            try {
                const ws = new WebSocket(`${WS_URL}?token=${token}`);
                wsRef.current = ws;

                ws.onopen = () =>  {
                    console.log("WebSocket connected successfully");
                    setIsConnecting(false);
                    setError(null);
                    setSocket(ws);
                    ws.send(JSON.stringify({
                        type: "join_room",
                        roomId
                    }))
                }

                ws.onerror = (err) => {
                    console.error("WebSocket error:", err);
                    setIsConnecting(false);
                    setError("Failed to connect to server. Make sure the WebSocket server is running on port 8080.");
                }

                ws.onclose = (event) => {
                    console.log("WebSocket connection closed", event.code, event.reason);
                    setSocket(null);
                    
                    // Only show error if it wasn't a clean close
                    if (event.code !== 1000 && !error) {
                        setError("Connection lost. Please refresh the page.");
                    }
                }
            } catch (err) {
                console.error("Error creating WebSocket:", err);
                setIsConnecting(false);
                setError("Failed to create WebSocket connection");
            }
        }, 100); // Small delay to ensure localStorage is ready

        return () => {
            clearTimeout(initTimeout);
            clearTimeout(reconnectTimeoutRef.current);
            
            // Clean close the WebSocket
            if (wsRef.current) {
                const ws = wsRef.current;
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close(1000, "Component unmounting");
                } else if (ws.readyState === WebSocket.CONNECTING) {
                    // Wait a bit for connection to establish before closing
                    setTimeout(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.close(1000, "Component unmounting");
                        }
                    }, 500);
                }
                wsRef.current = null;
            }
        }

    }, [roomId, router])




    if(error) {
        return <div className="flex items-center justify-center h-screen flex-col gap-4">
            <div className="text-red-500 text-lg">{error}</div>
            <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
                Retry Connection
            </button>
        </div>
    }

    if(isConnecting || !socket) {
        return <div className="flex items-center justify-center h-screen">
            <div className="text-lg">Connecting to server...</div>
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}
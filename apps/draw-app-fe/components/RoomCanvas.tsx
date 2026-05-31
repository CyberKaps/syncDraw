"use client";

import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";


export function RoomCanvas({roomId}: {
    roomId: string
}) {
    
    const [socket, setSocket] = useState<WebSocket | null > (null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [needsPassword, setNeedsPassword] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [wsUrl, setWsUrl] = useState<string>("");
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        // Small delay to ensure localStorage is ready after navigation
        const initTimeout = setTimeout(() => {
            const token = localStorage.getItem("token");

            // Prevent creating multiple connections
            if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
                return;
            }

            try {
                const url = token ? `${WS_URL}?token=${token}` : WS_URL;
                setWsUrl(url);
                const ws = new WebSocket(url);
                wsRef.current = ws;

                ws.onopen = () =>  {
                    console.log("WebSocket connected successfully");
                    const savedPassword = sessionStorage.getItem(`room_password_${roomId}`);
                    ws.send(JSON.stringify({
                        type: "join_room",
                        roomId,
                        password: savedPassword || undefined
                    }))
                }

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === "error" && data.code === "PASSWORD_REQUIRED") {
                        setNeedsPassword(true);
                        setIsConnecting(false);
                        ws.close(1000, "Password required");
                    } else if (data.type === "error" && data.code === "ROOM_NOT_FOUND") {
                        setError("This room does not exist.");
                        setIsConnecting(false);
                    } else if (data.type === "join_room_success") {
                        setIsConnecting(false);
                        setError(null);
                        setSocket(ws);
                    } else if (data.type === "chat" || data.type === "update" || data.type === "delete" || data.type === "clear_all") {
                        // Regular canvas messages
                    }
                }

                ws.onerror = (err) => {
                    console.error("WebSocket error:", err);
                    setIsConnecting(false);
                    setError("Failed to connect to server. Make sure the WebSocket server is running on port 8080.");
                }

                ws.onclose = (event) => {
                    console.log("WebSocket connection closed", event.code, event.reason);
                    setSocket(null);
                    
                    // Only show error if it wasn't a clean close or expected close
                    if (event.code !== 1000 && !error && !needsPassword) {
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
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // error is intentionally excluded from deps to avoid infinite loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, router])




    const handlePasswordSubmit = () => {
        if (passwordInput.trim()) {
            sessionStorage.setItem(`room_password_${roomId}`, passwordInput);
            setNeedsPassword(false);
            setIsConnecting(true);
            setError(null);
            
            // Reconnect
            if (wsRef.current) wsRef.current.close();
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            
            ws.onopen = () =>  {
                ws.send(JSON.stringify({
                    type: "join_room",
                    roomId,
                    password: passwordInput
                }));
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "error" && data.code === "PASSWORD_REQUIRED") {
                    setNeedsPassword(true);
                    setIsConnecting(false);
                    setError("Incorrect password. Please try again.");
                    ws.close(1000, "Password required");
                } else if (data.type === "join_room_success") {
                    setIsConnecting(false);
                    setError(null);
                    setSocket(ws);
                } else {
                    // Regular canvas messages
                }
            };
            
            ws.onerror = (err) => {
                setIsConnecting(false);
                setError("Failed to connect to server.");
            };
        }
    };

    if (needsPassword) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#030303]">
                <div className="p-8 m-2 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl w-[400px]">
                    <h2 className="text-white text-2xl font-bold mb-2">Password Required</h2>
                    <p className="text-zinc-400 text-sm mb-6">This room is protected. Please enter the password to join.</p>
                    
                    <div className="mb-4">
                        <Input
                            type="password"
                            placeholder="Room password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                            className="w-full bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    
                    {error && (
                        <p className="text-red-400 text-sm mb-4">{error}</p>
                    )}
                    
                    <Button 
                        className="bg-indigo-600 text-white p-3 w-full rounded-lg hover:bg-indigo-700 font-medium"
                        onClick={handlePasswordSubmit}
                    >
                        Unlock Room
                    </Button>
                </div>
            </div>
        );
    }

    if(error) {
        return <div className="flex items-center justify-center h-screen flex-col gap-4 bg-[#030303]">
            <div className="text-red-500 text-lg">{error}</div>
            <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
                Retry Connection
            </button>
        </div>
    }

    if(isConnecting || !socket) {
        return <div className="flex items-center justify-center h-screen bg-[#030303]">
            <div className="text-zinc-400 text-lg animate-pulse">Connecting to room...</div>
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}
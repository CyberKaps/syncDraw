"use client";

import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";


export function RoomCanvas({roomId}: {
    roomId: string
}) {
    
    const [socket, setSocket] = useState<WebSocket | null > (null);

    useEffect(() => {

        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNWEzNDVmMS01MDU0LTQ4MGEtODdmNS1iZGFlNWY5YzJhYmQiLCJpYXQiOjE3NTA0MTUwNjV9.ka454SxJFXvTaA6vwNpWAQFwirbNNLPfJNEZ1FF6NNQ`);

        ws.onopen = () =>  {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }

    }, [])




    if(!socket) {
        return <div>Connecting to server...</div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}
"use client";

import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";


export function RoomCanvas({roomId}: {
    roomId: string
}) {
    
    const [socket, setSocket] = useState<WebSocket | null > (null);

    useEffect(() => {

        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MTIxNmQ3NC04MmNmLTQwZjUtYmM1OC1kYmEzZjVlMjJmMDUiLCJpYXQiOjE3NjMwMjM4MDN9.9B0X3hVp9r_X5K3qJKLVDCDhTwpWegQsQGpjLH2zrp0`);

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
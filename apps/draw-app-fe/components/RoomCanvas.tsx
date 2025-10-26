"use client";

import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";


export function RoomCanvas({roomId}: {
    roomId: string
}) {
    
    const [socket, setSocket] = useState<WebSocket | null > (null);

    useEffect(() => {

        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmVlZWY0OC02Y2M5LTQ3NTYtODE5Ny0zY2Q0ZmFiYTE0NGUiLCJpYXQiOjE3NjE0NTk1ODB9.PoaagApftniOFMx2CCGPAXemGF0eEJ98xNL8OrpMLSQ`);

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
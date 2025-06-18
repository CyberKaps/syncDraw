import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";


export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();


    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhNTJjZmM2My05Njk1LTQyNTQtOTUwNi0wNTQzNDY1MTFmMjgiLCJpYXQiOjE3NTAwNTkyMjh9.yXupzBt4BsWPyb2I-xwwzmxLYiWhb53wXANn4IOrwao`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }
}
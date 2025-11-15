import { HTTP_BACKEND } from "@/config";
import axios from "axios";



export async function getExistingShapes(roomSlug: string) {
    try {
        // First, get the room by slug to get its ID
        const roomRes = await axios.get(`${HTTP_BACKEND}/room/${roomSlug}`);
        const room = roomRes.data.room;
        
        if (!room) {
            console.error("Room not found");
            return [];
        }

        // Then fetch chats using the numeric room ID
        const res = await axios.get(`${HTTP_BACKEND}/chats/${room.id}`);
        const messages = res.data.messages;

        const shapes = messages.map((x: {message: string}) => {
            const messageData = JSON.parse(x.message);
            return messageData.shape;
        })

        return shapes;
    } catch (error) {
        console.error("Error fetching shapes:", error);
        return [];
    }
}
import { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import WebSocket from 'ws';
import { prismaClient } from "@repo/db/client"

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded  = jwt.verify(token, JWT_SECRET);

        if(typeof decoded == 'string') {
            return null;
        }

        if(!decoded || !decoded.userId) {
            return null;
        }

        return decoded.userId;

    } catch(e){
        return null;
    }
    return null;
}

wss.on('connection', function connection(ws, request) {

    const url = request.url;

    if(!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    
    const userId = (checkUser(token));
    if(userId == null) {
        ws.close();
        return null;
    }

    users.push({
        userId,
        rooms: [],
        ws
    })

    ws.on('message',async function message(data) {
        const parsedData = JSON.parse(data as unknown as string);
        console.log('Received message type:', parsedData.type); // Debug log

        if (parsedData.type == "join_room") {
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        if (parsedData.type == "leave_room") {
            const user = users.find(x => x.ws === ws);
            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x === parsedData.room);
        }

        if (parsedData.type === "chat") {
            const roomSlug = parsedData.roomId; // This is actually the room slug, not id
            const message = parsedData.message;

            // ✅ Step 1: Check if room exists and get its id
            const room = await prismaClient.room.findUnique({
                where: { slug: roomSlug }
            });

            if (!room) {
                // Optionally notify the client of failure
                ws.send(JSON.stringify({
                    type: "error",
                    message: `Room ${roomSlug} does not exist.`
                }));
                return;
            }

            await prismaClient.chat.create({
                data: {
                    roomId: room.id,
                    message,
                    userId
                }
            });
            
            // Broadcast to all users in the room (EXCEPT the sender)
            users.forEach(user => {
                if(user.rooms.includes(parsedData.roomId) && user.ws !== ws) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId: parsedData.roomId
                    }))
                }
            })
        }

        //  Handle update messages for real-time drag/resize
        if (parsedData.type === "update") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            
            console.log('Broadcasting update to room:', roomId); // Debug log
            
            // Broadcast to all users in the room (EXCEPT the sender)
            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws) {
                    user.ws.send(JSON.stringify({
                        type: "update",
                        message: message,
                        roomId
                    }))
                }
            })
        }
    });

    ws.on('close', () => {
        // Remove user from users array when they disconnect
        const index = users.findIndex(user => user.ws === ws);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
    
});
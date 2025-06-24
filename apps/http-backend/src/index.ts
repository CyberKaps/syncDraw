import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { parse } from "path";
import cors from "cors"




const app = express();
app.use(express.json());
app.use(cors())

app.post("/signup",async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            error: "Invalid data"
        });
        return;
    }

    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.username,
                //TODO: hash the password before storing it
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })

        res.json({
            userId: user.id,
        })
    } catch (error) {
        res.status(411).json({
            error: "User already exists"
        });
    }

});

app.post("/signin",async (req, res) => {

    const parsedData = SignInSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            error: "Invalid data"
        });
        return;
    }

    // TODO: compare the hashed password here
    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if(!user) {
        res.status(403).json({
            error: "Not authorized"
        });
        return;
    }
    
    const token = jwt.sign({
        userId: user.id,
    }, JWT_SECRET);

    res.json({
        token
    })
    
});

app.post("/room",middleware,async (req, res) => {

    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            error: "Invalid data"
        });
        return;
    }
    // @ts-ignore TODO: fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
        data: {
            slug: parsedData.data.name,
            adminId: userId,
        }
    })

    res.json({
        roomId: room.id
    })
    } catch (error) {
        res.status(411).json({
            error: "Room already exists"
        });
    }
});

app.get("/chats/:roomId",async (req,res) => {
    try {
        const roomId = Number(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    });
    
    res.json({
        messages
    })
    } catch(e) {
        res.json({
            message: []
        })
    }
})

app.get("/room/:slug",async (req,res) => {
    const slug =req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });
    
    res.json({
        room
    })
})

app.listen(3001);
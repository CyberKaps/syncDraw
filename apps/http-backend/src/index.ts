import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { parse } from "path";


const app = express();
app.use(express.json());


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

app.get("/chat/:roomId", (req,res) => {
    const roomId = Number(req.params.roomId);
    const messages = prismaClient.room.findMany({
        where: {
            id: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    });

    res.json({
        messages
    })
})

app.listen(3001);
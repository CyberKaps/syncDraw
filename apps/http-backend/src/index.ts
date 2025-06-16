import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";


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

app.post("/signin", (req, res) => {

    const data = SignInSchema.safeParse(req.body);
    if(!data.success) {
        res.status(400).json({
            error: "Invalid data"
        });
        return;
    }

    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        token
    })
    
});

app.post("/room",middleware, (req, res) => {

    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success) {
        res.status(400).json({
            error: "Invalid data"
        });
        return;
    }

    res.json({
        roomId: 123
    })
});

app.listen(3001);
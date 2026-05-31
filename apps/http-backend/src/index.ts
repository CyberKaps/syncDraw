import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SignInSchema, CreateRoomSchema, JoinRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { GoogleGenAI, Type, Schema } from "@google/genai";

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

    console.log(parsedData)

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
        console.log(error)
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
    // @ts-ignore
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
        data: {
            slug: parsedData.data.name,
            password: parsedData.data.password || null,
            adminId: userId,
        }
    })

    res.json({
        roomId: room.id,
        slug: room.slug
    })
    } catch (error) {
        res.status(411).json({
            error: "Room already exists"
        });
    }
});

// Get user's rooms
app.get("/user/rooms", middleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        
        const rooms = await prismaClient.room.findMany({
            where: {
                adminId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                slug: true,
                password: true,
                createdAt: true
            }
        });

        res.json({ rooms });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
});

// Delete room
app.delete("/room/:slug", middleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const slug = req.params.slug;

        const room = await prismaClient.room.findFirst({
            where: { slug }
        });

        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return;
        }

        if (room.adminId !== userId) {
            res.status(403).json({ error: "Not authorized to delete this room" });
            return;
        }

        // Delete all chats (shapes) associated with this room first
        await prismaClient.chat.deleteMany({
            where: { roomId: room.id }
        });

        // Then delete the room
        await prismaClient.room.delete({
            where: { id: room.id }
        });

        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ error: "Failed to delete room" });
    }
});

// Verify room password
app.post("/room/verify", async (req, res) => {
    try {
        const parsedData = JoinRoomSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: "Invalid data" });
            return;
        }

        const room = await prismaClient.room.findFirst({
            where: { slug: parsedData.data.slug }
        });

        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return;
        }

        // If room has password, verify it
        if (room.password) {
            if (!parsedData.data.password || room.password !== parsedData.data.password) {
                res.status(403).json({ error: "Incorrect password" });
                return;
            }
        }

        res.json({ 
            success: true,
            room: {
                id: room.id,
                slug: room.slug,
                hasPassword: !!room.password
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to verify room" });
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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const shapeSchema: Schema = {
  type: Type.ARRAY,
  description: "A list of shapes that make up the architecture diagram or flowchart. Arrange them logically so they don't overlap heavily. Use connecting lines or arrows between boxes.",
  items: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: "The type of shape: 'rect', 'circle', 'diamond', 'text', 'line', or 'arrow'.",
      },
      x: { type: Type.INTEGER, description: "X coordinate (for rect, diamond, text). Space elements out well (e.g. 100, 300, 500)." },
      y: { type: Type.INTEGER, description: "Y coordinate (for rect, diamond, text). Space elements out well." },
      width: { type: Type.INTEGER, description: "Width (for rect, diamond). Usually between 100 and 200." },
      height: { type: Type.INTEGER, description: "Height (for rect, diamond). Usually between 60 and 100." },
      centerX: { type: Type.INTEGER, description: "Center X (for circle)." },
      centerY: { type: Type.INTEGER, description: "Center Y (for circle)." },
      radius: { type: Type.INTEGER, description: "Radius (for circle)." },
      startX: { type: Type.INTEGER, description: "Start X (for line, arrow)." },
      startY: { type: Type.INTEGER, description: "Start Y (for line, arrow)." },
      endX: { type: Type.INTEGER, description: "End X (for line, arrow)." },
      endY: { type: Type.INTEGER, description: "End Y (for line, arrow)." },
      content: { type: Type.STRING, description: "Text content (for text shape). Keep it concise. For lines/arrows, just put empty string." },
      fontSize: { type: Type.INTEGER, description: "Font size for text (default 24)." }
    },
    required: ["type", "x", "y", "width", "height", "startX", "startY", "endX", "endY", "content"],
  },
};

app.post("/generate-diagram", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate an architecture diagram or flowchart for the following request: "${prompt}". 
              
CRITICAL INSTRUCTIONS:
1. You MUST generate multiple shapes. A 'text' shape ONLY draws text without any border. Therefore, you MUST pair every 'text' shape with a 'rect' or 'circle' shape to act as its container.
2. You MUST generate 'arrow' or 'line' shapes connecting the containers.
3. Ensure all 'rect' shapes have 'width' and 'height' fields set (e.g. width: 150, height: 80).
4. Ensure all 'arrow' shapes have 'startX', 'startY', 'endX', 'endY'.
5. Return ONLY valid JSON matching the schema.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: shapeSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }

    const shapes = JSON.parse(text);
    console.log("Shapes from AI:", JSON.stringify(shapes, null, 2));
    res.json({ shapes });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate diagram", details: error.message });
  }
});

app.listen(3001);
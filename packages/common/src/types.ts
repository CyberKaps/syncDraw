import { z } from 'zod';

export const CreateUserSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(100),
    name: z.string()
})


export const SignInSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(100),
})

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20),
    password: z.string().min(4).max(50).optional()
})

export const JoinRoomSchema = z.object({
    slug: z.string().min(3).max(20),
    password: z.string().optional()
})
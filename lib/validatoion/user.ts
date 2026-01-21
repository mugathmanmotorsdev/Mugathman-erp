import * as z from "zod";

export const userSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    role: z.enum(["EDITOR", "VIEWER"]),
})

export const userActivation = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long").max(50, "Password too long"),
    confirmPassword:  z.string().min(8, "Password must be at least 8 characters long").max(50, "Password too long")
})
.refine((data) => data.confirmPassword === data.password, {
    message: "Password don't match",
    path: ["confirmPassword"]
})

export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"), 
})
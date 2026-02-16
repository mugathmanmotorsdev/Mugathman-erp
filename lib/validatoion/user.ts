import * as z from "zod";

export const userCreateSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
})

export const userActivationSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long").max(50, "Password too long"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters long").max(50, "Password too long")
})
    .refine((data) => data.confirmPassword === data.password, {
        message: "Password don't match",
        path: ["confirmPassword"]
    })

export const signInSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type SignInValues = z.infer<typeof signInSchema>
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "./prisma"
import { comparePassword } from "./password"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
        credentials: {
            email: {
                type: "email",
                label: "Email",
                placeholder: "example@gmail.com"
            },
            password: {
                type: "password",
                label: "Password",
                placeholder: "*****",
            },
        },

        authorize: async (credentials) => {
            const { email, password } = credentials as Record<"email" | "password", string>

            if (!email || !password) {
                throw new Error("Invalid credentials")
            }

            const user = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })

            if (!user) {
                throw new Error("No user found")
            }

            const isPasswordValid = await comparePassword(password, user.password)

            if (!isPasswordValid) {
                throw new Error("Invalid password")
            }

            return {
                id: user.id,
                email: user.email,
                name: user.full_name,
                role: user.role
            }
        }
    })
  ],
})
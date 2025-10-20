import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
        credentials: {
            password: {
                type: "password",
                label: "Password",
                placeholder: "*****",
            },
        },

        authorize: async (credentials) => {
    
            // logic to verify if the user exists
            const isAuth = credentials?.password === process.env.GENERAL_PASS
    
            if (!isAuth) {
            // No user found, so this is their first attempt to login
            // Optionally, this is also the place you could do a user registration
            throw new Error("Invalid credentials.")
            }
    
            // return user object with their profile data (must match NextAuth's User shape)
            return {
                username: process.env.USER_NAME || "admin",
                email: "info@mugathmanmotors.com"
            }
        }
    })
  ],
})
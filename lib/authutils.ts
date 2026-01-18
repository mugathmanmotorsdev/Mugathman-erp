import { auth } from "./auth"
import prisma from "./prisma"
import { generateToken } from "./utils/token-generator"
import { User } from "@generated/prisma"

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

export async function generateActivationToken(user: User) {
  const token = generateToken()
  const activationToken = await prisma.userActivationToken.create({
    data: {
      user_id: user.id,
      token,
    },
  })
  return activationToken
}

"use server"
import { auth } from "../auth"
import prisma from "../prisma"
import { generateToken } from "./token-generator"
import { AppError } from "./app-error"
import { User, Role } from "@generated/prisma"

export { AppError }

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new AppError('Authentication required', 401)
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  return user
}


export async function setActivationToken(user: User) {
  const token = generateToken()
  const activationToken = await prisma.userActivationToken.create({
    data: {
      user_id: user.id,
      token,
      expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  return activationToken
}

export async function setResetPasswordToken(user: User) {
  const token = generateToken()
  const resetPasswordToken = await prisma.resetPasswordToken.create({
    data: {
      user_id: user.id,
      token,
      expired_at: new Date(Date.now() + 1 * 60 * 60 * 1000),
    },
  })

  return resetPasswordToken
}

export async function roleGuard(user: User, roles: Role[]) {
  if (!user) {
    throw new AppError('Authentication required', 401)
  }

  if (!roles.includes(user.role)) {
    throw new AppError('Unauthorized', 403)
  }
}


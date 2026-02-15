"use server"
import { auth } from "../auth"
import prisma from "../prisma"
import { generateToken } from "./token-generator"
import { User, Role } from "@generated/prisma"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Authentication required')
  }
  
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })

  if (!user) {
    throw new Error('User not found')
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
    throw new Error('Authentication required')
  }

  if (!roles.includes(user.role)) {
    throw new Error('Unauthorized')
  }
}

export async function canAccessRoute(user: User, route: string) {
  const routeRoles: Record<string, Role[]> = {
    "/users": ["ADMIN"],
    "/users/[id]": ["ADMIN"],
    "/users/[id]/deactivate": ["ADMIN"],
    "/users/[id]/activate": ["ADMIN"],
  }

  if (!user) {
    return false
  }

  if (routeRoles[route]?.includes(user.role)) {
    return true
  }

  return false
}


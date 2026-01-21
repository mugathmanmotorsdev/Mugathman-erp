import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/password";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const userData = await request.json()
    // validate request data
    if (!userData.token || !userData.password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // find token
        const token = await prisma.resetPasswordToken.findUnique({
            where: {
                token: userData.token
            }
        })
        // validate token
        if (!token) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }
        // validate token expiration
        if (token.expired_at < new Date()) {
            return NextResponse.json({ error: "Token expired" }, { status: 400 });
        }

        // find user
        const user = await prisma.user.findUnique({
            where: {
                id: token.user_id
            }
        })
        // validate user
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // hash password
        const hashedPassword = await hashPassword(userData.password)

        // update user
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword
            }
        })

        // delete token
        await prisma.resetPasswordToken.delete({
            where: {
                token: userData.token
            }
        })

        return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
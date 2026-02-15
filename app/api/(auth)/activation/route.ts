import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/password";

export async function POST(request: NextRequest) {
    const data = await request.json()
    if (!data.token || !data.password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!data.token) {
        return NextResponse.json({ error: "Missing activation token" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(data.password)

    try {
        // find token
        const token = await prisma.userActivationToken.findFirst({
            where: {
                token: data.token
            }
        })
        // check if token exists
        if (!token) {
            return NextResponse.json({ error: "Invalid activation token" }, { status: 400 });
        }
        // check if token is expired
        if (token.expired_at < new Date()) {
            return NextResponse.json({ error: "Activation token expired" }, { status: 400 });
        }

        // update user
        const updatedUser = await prisma.user.update({
            where: {
                id: token.user_id
            },
            data: {
                status: "ACTIVE",
                password: hashedPassword
            }
        })

        // delete token
        await prisma.userActivationToken.delete({
            where: {
                token: data.token
            }
        })

        return NextResponse.json({ message: "User activated successfully" }, { status: 200 });
    } catch (error) {
        console.log("Error activating user: ", error)
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

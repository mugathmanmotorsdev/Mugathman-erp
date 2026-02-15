import prisma from "@/lib/prisma";
import { requireAuth, roleGuard } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id

    try {
        const user = await requireAuth()
        roleGuard(user, ["ADMIN"])

        const userData = await prisma.user.findUnique({
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                status: true,
                created_at: true,
            },
            where: {
                id: id
            },
        })
        return NextResponse.json({ userData }, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id
    const userData = await request.json()

    try {
        const user = await requireAuth()
        roleGuard(user, ["ADMIN"])

        const updatedUser = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                ...userData
            }
        })
        return NextResponse.json({ updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
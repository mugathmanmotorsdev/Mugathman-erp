import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, roleGuard } from "@/lib/utils/auth-utils";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id

    try {
        const user = await requireAuth()
        roleGuard(user, ["ADMIN"])

        const updatedUser = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                status: "ACTIVE"
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
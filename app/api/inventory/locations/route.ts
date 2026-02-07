import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await requireAuth();
        const locations = await prisma.inventoryLocation.findMany({
            where: {
                is_active: true
            }
        });
        return NextResponse.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Mising required field"}, {status: 400})
        }

        const location = await prisma.inventoryLocation.create({
            data: {
                name
            }
        })
        return NextResponse.json(location);
    } catch (error) {
        console.error("Error creating location:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
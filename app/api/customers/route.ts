import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await requireAuth();
        const customers = await prisma.customer.findMany({
            orderBy: {
                full_name: 'asc'
            }
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAuth();
        const body = await request.json();
        const { full_name, phone, email, address } = body;

        if (!full_name || !phone) {
            return NextResponse.json({ error: "Missing required fields: full_name and phone" }, { status: 400 });
        }

        const customer = await prisma.customer.create({
            data: {
                full_name,
                phone,
                email,
                address
            }
        });
        return NextResponse.json(customer);
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

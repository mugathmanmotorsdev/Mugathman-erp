import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    return NextResponse.json({ message: "Hello, world!" });
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();

        const body = await request.json();
        const product_id = body.product_id;
        const location_id = body.location_id;
        const vehicle_id = body.vehicle_id;
        const quantity = body.quantity;
        const reason = body.reason;
        const reference_type = body.reference_type;
        const reference_id = body.reference_id;
        const performed_by = user.id;

        if (
            !product_id ||
            !location_id ||
            !quantity ||
            !reason ||
            !reference_type ||
            !reference_id ||
            !performed_by
        ) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const stock_movement = await prisma.stockMovement.create({
            data: {
                product_id,
                location_id,
                vehicle_id,
                quantity,
                reason,
                reference_type,
                reference_id,
                performed_by,
            }
        });

        return NextResponse.json(stock_movement);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


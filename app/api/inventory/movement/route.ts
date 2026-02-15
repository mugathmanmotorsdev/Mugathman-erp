import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        // require authentication
        const user = await requireAuth();

        // get request body
        const body = await request.json();
        const {
            product_id,
            location_id,
            vehicle_id,
            reason,
            reference_type,
            reference_id,
            movement_type
        } = body;
        const quantity = Number(body.quantity);
        const performed_by = user.id;

        // validate required fields
        if (
            !product_id ||
            !location_id ||
            !quantity ||
            !reason ||
            !reference_type ||
            !performed_by
        ) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // get product
        const product = await prisma.product.findUnique({
            where: {
                id: product_id,
            },
        });

        // check stock availability
        if (movement_type === "OUT" && product?.tracking_type === "BATCH") {
            const stock = await prisma.stockMovement.aggregate({
                where: {
                    product_id: product_id,
                },
                _sum: {
                    quantity: true,
                },
            });
            const totalStock = stock._sum.quantity || 0;
            const requestedOut = Math.abs(quantity);
            if (totalStock < requestedOut) {
                return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
            }
        }

        const data: any = {
            product_id,
            location_id,
            quantity,
            reason,
            type: movement_type,
            reference_type,
            reference_id,
            performed_by,
        }

        if (vehicle_id) {
            data.vehicle_id = vehicle_id;
        }

        // create stock movement
        const stock_movement = await prisma.stockMovement.create({
            data
        });

        // create serialize movement if tracking type is serial
        if (product?.tracking_type === "SERIAL") {
            await prisma.serializeMovement.create({
                data: {
                    stock_movement_id: stock_movement.id,
                    vehicle_id,
                }
            });
        }

        return NextResponse.json(stock_movement);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await requireAuth();
        const searchParams = request.nextUrl.searchParams;
        const productId = searchParams.get("product_id");
        const reason = searchParams.get("reason");
        const skip = Number(searchParams.get("skip")) || 0;
        const take = Number(searchParams.get("take")) || 50;

        const where: Record<string, unknown> = {};
        if (productId) where.product_id = productId;
        if (reason) where.reason = reason;

        const movements = await prisma.stockMovement.findMany({
            where,
            include: {
                product: { select: { name: true, sku: true } },
                vehicle: { select: { vin: true, color: true } },
                user: { select: { full_name: true } },
            },
            orderBy: { created_at: "desc" },
            skip,
            take,
        });

        const totalCount = await prisma.stockMovement.count({ where });

        return NextResponse.json({ movements, pagination: { total: totalCount, skip, take } });
    } catch (error) {
        console.error("Error fetching movements:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: error instanceof AppError ? error.status : 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const {
            product_id,
            vehicle_id,
            quantity,
            reason,
            movement_type,
            color,
            new_vin,
        } = body;

        if (!product_id || !quantity || !reason || !movement_type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id: product_id },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (movement_type === "OUT" && product.tracking_type === "BATCH") {
            const stock = await prisma.stockMovement.aggregate({
                where: { product_id },
                _sum: { quantity: true },
            });
            const totalStock = stock._sum.quantity || 0;
            if (totalStock < Math.abs(Number(quantity))) {
                return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
            }
        }

        const performed_by = user.id;

        let stockMovement;

        if (product.tracking_type === "SERIAL") {
            stockMovement = await prisma.$transaction(async (tx) => {
                let finalVehicleId = vehicle_id;

                if (movement_type === "IN" && new_vin) {
                    const existing = await tx.vehicle.findUnique({ where: { vin: new_vin } });
                    if (existing) throw new Error("Vehicle with this VIN already exists");

                    const vehicle = await tx.vehicle.create({
                        data: {
                            product_id,
                            vin: new_vin,
                            status: "AVAILABLE",
                            color: color || undefined,
                        },
                    });
                    finalVehicleId = vehicle.id;
                }

                if (!finalVehicleId) throw new Error("Vehicle ID is required for serial-tracked products");

                const movement = await tx.stockMovement.create({
                    data: {
                        product_id,
                        vehicle_id: finalVehicleId,
                        quantity: Number(quantity),
                        reason,
                        type: movement_type,
                        performed_by,
                    },
                });

                return movement;
            });
        } else {
            stockMovement = await prisma.stockMovement.create({
                data: {
                    product_id,
                    vehicle_id: vehicle_id || null,
                    quantity: Number(quantity),
                    reason,
                    type: movement_type,
                    performed_by,
                },
            });
        }

        return NextResponse.json(stockMovement);
    } catch (error) {
        console.error("Error recording movement:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: errorMessage },
            { status: error instanceof AppError ? error.status : 400 }
        );
    }
}
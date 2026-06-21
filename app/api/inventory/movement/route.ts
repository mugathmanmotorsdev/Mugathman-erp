import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
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
            new_vin,
            reason,
            reference_type,
            reference_id,
            movement_type,
            color
        } = body;
        const quantity = Number(body.quantity);
        const performed_by = user.id;

        // validate required fields
        if (
            !product_id ||
            !location_id ||
            !quantity ||
            !reason ||
            !performed_by
        ) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // get product (needed for tracking type checks below)
        const product = await prisma.product.findUnique({
            where: {
                id: product_id,
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // check stock availability for batch OUT
        if (movement_type === "OUT" && product.tracking_type === "BATCH") {
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

        const movementData = {
            product_id,
            location_id,
            quantity,
            reason,
            type: movement_type,
            reference_type: reference_type || null,
            reference_id,
            performed_by,
        };

        let stock_movement;

        // --- SERIAL-tracked products: use a transaction for atomicity ---
        if (product.tracking_type === "SERIAL") {
            stock_movement = await prisma.$transaction(async (tx) => {
                let finalVehicleId = vehicle_id;

                // IN + new_vin: create the vehicle inside the transaction
                if (movement_type === "IN" && new_vin) {
                    // Check VIN uniqueness
                    const existing = await tx.vehicle.findUnique({
                        where: { vin: new_vin },
                    });
                    if (existing) {
                        throw new Error("Vehicle with this VIN already exists");
                    }

                    // Create the vehicle
                    const vehicle = await tx.vehicle.create({
                        data: {
                            product_id,
                            inventory_location_id: location_id,
                            vin: new_vin,
                            status: "AVAILABLE",
                            color: color || undefined,
                        },
                    });
                    finalVehicleId = vehicle.id;
                }

                if (!finalVehicleId) {
                    throw new Error("Vehicle ID is required for serial-tracked products");
                }

                // Create stock movement
                const movement = await tx.stockMovement.create({
                    data: {
                        ...movementData,
                        vehicle_id: finalVehicleId,
                    },
                });

                // Link movement to vehicle via serialize_movements
                await tx.serializeMovement.create({
                    data: {
                        stock_movement_id: movement.id,
                        vehicle_id: finalVehicleId,
                    },
                });

                return movement;
            });
        } else {
            // --- BATCH-tracked products: single write, no transaction needed ---
            stock_movement = await prisma.stockMovement.create({
                data: movementData,
            });
        }

        return NextResponse.json(stock_movement);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: error instanceof AppError ? error.status : 400 });
    }
}

import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth();
        const { id } = await params;

        const sale = await prisma.sale.findUnique({
            where: { id },
            include: { sale_items: true },
        });

        if (!sale) {
            return NextResponse.json({ error: "Sale not found" }, { status: 404 });
        }

        if (sale.status === "CANCELLED") {
            return NextResponse.json({ error: "Sale is already cancelled" }, { status: 400 });
        }

        if (sale.status === "PENDING") {
            return NextResponse.json({ error: "Cannot cancel a pending sale" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Update sale status
            await tx.sale.update({
                where: { id },
                data: { status: "CANCELLED" },
            });

            // Reverse stock movements (IN for each sold item)
            for (const item of sale.sale_items) {
                await tx.stockMovement.create({
                    data: {
                        product_id: item.product_id,
                        vehicle_id: item.vehicle_id || null,
                        quantity: item.quantity,
                        type: "IN",
                        reason: "ADJUSTMENT",
                        performed_by: user.id,
                    },
                });

                // Restore vehicle status if this was a specific vehicle
                if (item.vehicle_id) {
                    await tx.vehicle.update({
                        where: { id: item.vehicle_id },
                        data: { status: "AVAILABLE" },
                    });
                }
            }
        });

        return NextResponse.json({ message: "Sale cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling sale:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: errorMessage },
            { status: error instanceof AppError ? error.status : 500 }
        );
    }
}
import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextResponse } from "next/server";

export async function GET() {
    await requireAuth();
    try {
        const products = await prisma.product.findMany();

        const stock_bulk = await prisma.stockMovement.groupBy({
            by: ['product_id'],
            _sum: {
                quantity: true,
            },
        });

        const stock_serialize = await prisma.stockMovement.groupBy({
            by: ['product_id'],
            _count: {
                _all: true,
            }
        });

        const bulkMap = new Map(
            stock_bulk.map((item) => ([item.product_id, item._sum.quantity]))
        )

        const serializeMap = new Map(
            stock_serialize.map((item) => ([item.product_id, item._count._all]))
        )

        const inventorySnapshot = products.map((product) => ({
            ...product,
            stock: product.tracking_type === "SERIAL" ?
                serializeMap.get(product.id) || 0 :
                bulkMap.get(product.id) || 0,
        }));

        return NextResponse.json(inventorySnapshot);
    } catch (error) {
        console.error("Error fetching inventory snapshot:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: error instanceof AppError ? error.status : 500 }
        );
    }
}

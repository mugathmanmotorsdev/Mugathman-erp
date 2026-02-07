import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

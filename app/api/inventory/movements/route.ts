import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { StockMovementReason } from "@generated/prisma/client";

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
        if (reason && Object.values(StockMovementReason).includes(reason as StockMovementReason)) {
            where.reason = reason;
        }

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
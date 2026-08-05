import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StockMovementType, StockMovementReason } from "@generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const type = searchParams.get("type");
    const reason = searchParams.get("reason");
    const productId = searchParams.get("productId");

    const where: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        (where.created_at as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.created_at as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    if (type && Object.values(StockMovementType).includes(type as StockMovementType)) {
      where.type = type as StockMovementType;
    }

    if (reason && Object.values(StockMovementReason).includes(reason as StockMovementReason)) {
      where.reason = reason as StockMovementReason;
    }

    if (productId) {
      where.product_id = productId;
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true, category: true } },
        vehicle: { select: { vin: true, color: true } },
        user: { select: { full_name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const totalIn = movements.filter((m) => m.type === "IN").reduce((acc, m) => acc + m.quantity, 0);
    const totalOut = movements.filter((m) => m.type === "OUT").reduce((acc, m) => acc + Math.abs(m.quantity), 0);

    const summary = {
      totalMovements: movements.length,
      totalIn,
      totalOut,
      netStock: totalIn - totalOut,
    };

    return NextResponse.json({ summary, movements });
  } catch (error) {
    console.error("Error fetching stock movements report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

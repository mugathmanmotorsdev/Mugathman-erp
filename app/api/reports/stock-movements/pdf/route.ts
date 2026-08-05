import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { generateStockMovementPDF } from "@/lib/pdf/generate-stock-pdf";
import { NextRequest, NextResponse } from "next/server";
import { StockMovementType, StockMovementReason } from "@generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const where: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) (where.created_at as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.created_at as Record<string, unknown>).lte = new Date(dateTo);
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

    const buffer = await generateStockMovementPDF(summary, movements as any, dateFrom, dateTo);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="stock-movement-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating stock movement PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { generateStockExport } from "@/lib/pdf/generate-stock-export";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const statusFilter = searchParams.get("statusFilter") || undefined;

    const where: Record<string, unknown> = { is_active: true };

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) (where.created_at as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.created_at as Record<string, unknown>).lte = new Date(dateTo);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    let products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        unit_price: true,
        reorder_level: true,
        tracking_type: true,
        is_active: true,
        description: true,
        unit: true,
        // created_at: true,
        stock_movements: {
          select: {
            quantity: true,
          },
        },
      },
    });

    if (statusFilter && statusFilter !== "all") {
      const stockStatus = statusFilter === "LOW_STOCK"
        ? "LOW_STOCK"
        : statusFilter;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products = products.filter((p) => {
        const stock = (p.stock_movements || []).reduce((acc: number, mov: { quantity: number }) => acc + mov.quantity, 0);
        if (stock === 0) return stockStatus === "OUT_OF_STOCK";
        if (stock <= p.reorder_level * 0.5) return stockStatus === "LOW_STOCK";
        return stockStatus === "IN_STOCK";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any[];
    }

    
    const productsWithStock = products.map((p) => {
      const currentStock = (p.stock_movements || []).reduce((acc: number, mov: { quantity: number }) => acc + mov.quantity, 0);
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unit_price: Number(p.unit_price),
        currentStock,
        reorder_level: p.reorder_level,
        tracking_type: p.tracking_type,
      };
    })

    const totalStockValue = productsWithStock.reduce(
      (acc, p) => acc + p.currentStock * p.unit_price,
      0
    );

    const lowStockCount = productsWithStock.filter(
      (p) => p.currentStock === 0 || p.currentStock <= p.reorder_level * 0.5
    ).length;

    const summary = {
      totalStockValue,
      lowStockCount,
    };

    const buffer = await generateStockExport(productsWithStock, summary, dateFrom, dateTo);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="stock-export-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating stock export PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

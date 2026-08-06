import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { generateSalesExport } from "@/lib/pdf/generate-sales-export";
import { NextRequest, NextResponse } from "next/server";
import { SaleStatus, PaymentStatus } from "@generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) (where.created_at as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.created_at as Record<string, unknown>).lte = new Date(dateTo);
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      where.payment_status = paymentStatus as PaymentStatus;
    }

    if (search) {
      where.OR = [
        { sale_number: { contains: search, mode: "insensitive" } },
        { customer: { full_name: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        user: { select: { full_name: true } },
        sale_items: { include: { product: true, vehicle: { select: { vin: true, color: true } } } },
        payments: true,
      },
      orderBy: { created_at: "desc" },
    });

    const totalRevenue = sales.reduce(
      (acc, s) => acc + s.sale_items.reduce((itemAcc, item) => itemAcc + Number(item.unit_price) * item.quantity, 0),
      0
    );

    const totalPaid = sales.reduce(
      (acc, s) => acc + s.payments.reduce((pAcc, p) => pAcc + Number(p.amount), 0),
      0
    );

    const totalOutstanding = totalRevenue - totalPaid;

    const summary = {
      totalRevenue,
      totalPaid,
      totalOutstanding,
      paidCount: sales.filter((s) => s.payment_status === "PAID").length,
      partiallyPaidCount: sales.filter((s) => s.payment_status === "PARTIALLY_PAID").length,
      pendingCount: sales.filter((s) => s.payment_status === "PENDING").length,
    };

    const buffer = await generateSalesExport(sales as any, summary, dateFrom, dateTo);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sales-export-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating sales export PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

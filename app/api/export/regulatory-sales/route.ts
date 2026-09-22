import prisma from "@/lib/prisma";
import { requireAuth, roleGuard, AppError } from "@/lib/utils/auth-utils";
import { generateRegulatorySalesExport } from "@/lib/pdf/generate-regulatory-export";
import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus, PaymentMethod, Prisma } from "@generated/prisma/client";

/**
 * GET /api/export/regulatory-sales
 * Statutory sales report for government / EFCC routine compliance.
 *
 * Privacy rules (deliberate):
 * - customer phone/email/address NEVER selected or rendered
 * - staff user NEVER selected
 * - payment notes NEVER selected
 * - CANCELLED sales excluded from query and totals
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await roleGuard(user, ["ADMIN"]);

    const searchParams = request.nextUrl.searchParams;

    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: Prisma.SaleWhereInput = {
      status: { not: "CANCELLED" },
    };

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = new Date(dateFrom);
      if (dateTo) where.created_at.lte = new Date(dateTo);
    }

    if (
      paymentStatus &&
      (Object.values(PaymentStatus) as string[]).includes(paymentStatus)
    ) {
      where.payment_status = paymentStatus as PaymentStatus;
    }

    if (search) {
      where.OR = [
        { sale_number: { contains: search, mode: "insensitive" } },
        { customer: { full_name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const sales = await prisma.sale.findMany({
      where,
      select: {
        id: true,
        sale_number: true,
        created_at: true,
        payment_status: true,
        customer: { select: { full_name: true } },
        sale_items: {
          select: {
            id: true,
            quantity: true,
            unit_price: true,
            product: { select: { name: true, sku: true } },
            vehicle: { select: { vin: true, color: true } },
          },
        },
        payments: {
          select: {
            amount: true,
            method: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const salesForPdf = sales.map((s) => ({
      ...s,
      created_at: s.created_at.toISOString(),
      payments: s.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
        created_at: p.created_at.toISOString(),
      })),
      sale_items: s.sale_items.map((item) => ({
        ...item,
        unit_price: Number(item.unit_price),
      })),
    }));

    const totalRevenue = sales.reduce(
      (acc, s) =>
        acc +
        s.sale_items.reduce(
          (itemAcc, item) => itemAcc + Number(item.unit_price) * item.quantity,
          0
        ),
      0
    );

    const totalPaid = sales.reduce(
      (acc, s) =>
        acc + s.payments.reduce((pAcc, p) => pAcc + Number(p.amount), 0),
      0
    );

    const totalOutstanding = totalRevenue - totalPaid;

    // Breakdown by payment method (counts distinct sales touching each method)
    const methodBreakdown = (Object.values(PaymentMethod) as PaymentMethod[])
      .map((method) => {
        const touched = sales.filter((s) =>
          s.payments.some((p) => p.method === method)
        );
        const total = touched.reduce(
          (acc, s) =>
            acc +
            s.payments
              .filter((p) => p.method === method)
              .reduce((pAcc, p) => pAcc + Number(p.amount), 0),
          0
        );
        return { method, count: touched.length, total };
      })
      .filter((m) => m.count > 0);

    const reportRef = `MUG-REG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(sales.length).padStart(4, "0")}`;

    const buffer = await generateRegulatorySalesExport(
      salesForPdf,
      {
        totalRevenue,
        totalPaid,
        totalOutstanding,
        transactionCount: sales.length,
        methodBreakdown,
      },
      reportRef,
      dateFrom,
      dateTo
    );

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="regulatory-sales-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating regulatory sales PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

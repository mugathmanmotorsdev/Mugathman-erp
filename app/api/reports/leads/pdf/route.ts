import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { generateLeadPDF } from "@/lib/pdf/generate-lead-pdf";
import { NextRequest, NextResponse } from "next/server";
import { LeadStatus } from "@generated/prisma/client";

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

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const summary = {
      totalLeads: leads.length,
      newCount: leads.filter((l) => l.status === "NEW").length,
      qualifiedCount: leads.filter((l) => l.status === "QUALIFIED").length,
      disqualifiedCount: leads.filter((l) => l.status === "DISQUALIFIED").length,
    };

    const buffer = await generateLeadPDF(summary, leads as any, dateFrom, dateTo);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="leads-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating leads PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

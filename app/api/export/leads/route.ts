import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { generateLeadsExport } from "@/lib/pdf/generate-leads-export";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) (where.created_at as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.created_at as Record<string, unknown>).lte = new Date(dateTo);
    }

    if (status && ["NEW", "QUALIFIED", "DISQUALIFIED"].includes(status)) {
      where.status = status as unknown as typeof where.status;
    }

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { organization: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const leadsWithDateStr = leads.map((l) => ({
      ...l,
      created_at: l.created_at.toISOString(),
    }));

    const summary = {
      newCount: leadsWithDateStr.filter((l) => l.status === "NEW").length,
      qualifiedCount: leadsWithDateStr.filter((l) => l.status === "QUALIFIED").length,
      disqualifiedCount: leadsWithDateStr.filter((l) => l.status === "DISQUALIFIED").length,
    };

    const buffer = await generateLeadsExport(leadsWithDateStr, summary, dateFrom, dateTo);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="leads-export-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating leads export PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LeadStatus } from "@generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const status = searchParams.get("status");

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

    if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
      where.status = status as LeadStatus;
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

    return NextResponse.json({ summary, leads });
  } catch (error) {
    console.error("Error fetching leads report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

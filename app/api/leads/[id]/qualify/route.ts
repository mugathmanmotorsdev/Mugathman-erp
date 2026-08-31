import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextResponse } from "next/server";

// POST /api/leads/[id]/qualify — Authenticated, mark lead as qualified and queue Meta conversion job
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.status === "QUALIFIED") {
      return NextResponse.json({
        error: "Lead is already qualified",
      }, { status: 400 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: { status: "QUALIFIED" },
    });

    // Queue a background job to send the conversion to Meta API
    await prisma.job.create({
      data: {
        type: "SEND_META_CONVERSION",
        payload: {
          leadId: id,
          fullName: lead.full_name,
          phone: lead.phone,
          productOfInterest: lead.product_of_interest,
        },
        maxRetries: 5,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error qualifying lead:", error);
    return NextResponse.json(
      { error: error instanceof AppError ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}
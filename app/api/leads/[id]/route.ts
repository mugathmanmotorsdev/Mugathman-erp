import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { LeadStatus } from "@generated/prisma/client";

// GET /api/leads/[id] — Authenticated, get single lead
export async function GET(
  request: NextRequest,
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

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: error instanceof AppError ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

// PATCH /api/leads/[id] — Authenticated, update lead status or other fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: status ? (status as LeadStatus) : lead.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: error instanceof AppError ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

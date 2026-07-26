import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { LeadStatus } from "@generated/prisma/client";

// POST /api/leads — Public endpoint for website visitor submissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, phone, organization, product_of_interest, message } =
      body;

    // Validate required fields
    if (!full_name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: full_name, email, phone" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        full_name,
        email,
        phone,
        organization: organization || null,
        product_of_interest: product_of_interest || null,
        message: message || null,
        status: LeadStatus.NEW,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/leads — Authenticated, list leads with optional status filter
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const skip = Number(searchParams.get("skip")) || 0;
    const take = Number(searchParams.get("take")) || 100;

    const where = status
      ? { status: status as LeadStatus }
      : {};

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take,
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: error instanceof AppError ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

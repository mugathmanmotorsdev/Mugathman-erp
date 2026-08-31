import prisma from "@/lib/prisma";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

// POST /api/leads — Public endpoint for website visitor submissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, phone, product_of_interest, message, source } = body;

    if (!full_name || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: full_name, phone" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        full_name,
        phone,
        product_of_interest: product_of_interest || null,
        message: message || null,
        source: source || null,
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

// GET /api/leads — Authenticated, list leads
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const skip = Number(searchParams.get("skip")) || 0;
    const take = Number(searchParams.get("take")) || 100;

    const leads = await prisma.lead.findMany({
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
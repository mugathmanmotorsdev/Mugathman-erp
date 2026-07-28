import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    // If no product_id provided, return all available vehicles (for backward compatibility)
    if (!productId) {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          status: "AVAILABLE",
        },
        select: {
          id: true,
          vin: true,
          color: true,
          product_id: true,
          status: true,
        },
      });

      return NextResponse.json(vehicles);
    }

    // If product_id provided, filter by it
    const vehicles = await prisma.vehicle.findMany({
      where: {
        product_id: productId,
        status: "AVAILABLE",
      },
      select: {
        id: true,
        vin: true,
        color: true,
        product_id: true,
        status: true,
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles by product:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}
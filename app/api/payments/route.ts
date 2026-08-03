import { requireAuth, AppError } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { getPaymentsBySale, createPayment } from "@/lib/actions/sales";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const saleId = searchParams.get("saleId");

  if (!saleId) {
    return NextResponse.json({ error: "Missing saleId" }, { status: 400 });
  }

  try {
    await requireAuth();
    const payments = await getPaymentsBySale(saleId);
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { sale_id, amount, method, notes } = body;

    if (!sale_id || !amount || !method) {
      return NextResponse.json(
        { error: "Missing required fields: sale_id, amount, method" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }

    const payment = await createPayment(sale_id, amount, method, notes);
    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    console.error("Error creating payment:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: err instanceof AppError ? err.status : 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth-utils";
import { getSale } from "@/lib/actions/sales";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await requireAuth();
        const sale = await getSale(id);

        if (!sale) {
            return NextResponse.json({ error: "Sale not found" }, { status: 404 });
        }

        return NextResponse.json(sale);
    } catch (error) {
        console.error("Error fetching sale:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
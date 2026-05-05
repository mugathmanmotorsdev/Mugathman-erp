import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateReceiptPDF } from "@/lib/pdf/generate-receipt-pdf";


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get("saleId");

    if (!saleId) {
        return NextResponse.json({ error: "Sale ID is required" }, { status: 400 });
    }

    try {
        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
            include: {
                customer: true,
                user: true,
                sale_items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!sale) {
            return NextResponse.json({ error: "Sale not found" }, { status: 404 });
        }

        const buffer = await generateReceiptPDF(sale as any);
        
        return new NextResponse(buffer as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=receipt-${sale.sale_number}.pdf`
            },
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}
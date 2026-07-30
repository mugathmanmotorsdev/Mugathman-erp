import { NextResponse, NextRequest } from "next/server"
import { getInvoice } from "@/lib/actions/invoices"
import { generateInvoicePDF } from "@/lib/pdf/generate-invoice-pdf"
import { Invoice } from "@/types/invoice"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const invoiceId = searchParams.get("invoiceId")

  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 })
  }

  const invoice = await getInvoice(invoiceId)

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  const pdfBuffer = await generateInvoicePDF(invoice as Invoice)

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${invoiceId}.pdf"`,
    },
  })
}

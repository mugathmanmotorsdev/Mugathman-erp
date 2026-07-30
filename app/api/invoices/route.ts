import { requireAuth, AppError } from "@/lib/utils/auth-utils"
import { NextRequest, NextResponse } from "next/server"
import { getInvoices, getInvoice } from "@/lib/actions/invoices"
import { findOrCreateCustomer } from "@/lib/actions/customer"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const skip = Number(searchParams.get("skip")) || 0
  const take = Number(searchParams.get("take")) || 100

  try {
    await requireAuth()
    const invoices = await getInvoices(skip, take)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof AppError ? error.status : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { customer_id, customer_details, items } = body

    if ((!customer_id && !customer_details) || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: customer info and items" },
        { status: 400 }
      )
    }

    // Validate items
    for (const item of items) {
      if (!item.product_id || item.quantity <= 0 || !item.unit_price) {
        return NextResponse.json(
          { error: "Each item must have a product_id, quantity > 0, and unit_price" },
          { status: 400 }
        )
      }
    }

    // Generate invoice number (e.g., INV-20260730-001)
    const date = new Date()
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, "")
    const count = await prisma.invoice.count({
      where: {
        created_at: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        },
      },
    })
    const invoice_number = `INV-${dateString}-${(count + 1).toString().padStart(3, "0")}`

    const result = await prisma.$transaction(async (tx) => {
      let final_customer_id = customer_id

      // Create or find Customer if details provided
      if (!final_customer_id && customer_details) {
        const customer = await findOrCreateCustomer(customer_details)
        final_customer_id = customer.id
      }

      // Calculate total amount
      const total_amount = items.reduce(
        (acc, item) => acc + Number(item.unit_price) * Number(item.quantity),
        0
      )

      // Create the Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoice_number,
          customer_id: final_customer_id,
          created_by: user.id,
          status: "PENDING",
          total_amount: total_amount,
        },
      })

      // Create InvoiceItems
      for (const item of items) {
        await tx.invoiceItem.create({
          data: {
            invoice_id: invoice.id,
            product_id: item.product_id,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          },
        })
      }

      return invoice
    })

    const invoice = await getInvoice(result.id)

    return NextResponse.json(invoice, { status: 201 })
  } catch (err) {
    console.error("Error creating invoice:", err)
    const errorMessage = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json(
      { error: errorMessage },
      { status: err instanceof AppError ? err.status : 500 }
    )
  }
}

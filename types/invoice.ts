import type { Prisma, InvoiceItem as InvoiceItemPrisma } from "@/generated/prisma/client"

export type Invoice = Prisma.InvoiceGetPayload<{
  include: {
    customer: true
    user: {
      select: {
        full_name: true
      }
    }
    items: {
      include: {
        product: true
      }
    }
  }
}>

export interface InvoiceItem extends Omit<InvoiceItemPrisma, "invoice_id" | "unit_price"> {
  invoice_id?: string
  unit_price: number | Prisma.Decimal
  product_name: string
}

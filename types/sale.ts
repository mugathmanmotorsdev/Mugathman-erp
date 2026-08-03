import type { Prisma, SaleItem as SaleItemPrisma } from "@/generated/prisma/client";

export type Sale = Prisma.SaleGetPayload<{
  include: {
    customer: true,
    user: true,
    sale_items: {
      include: {
        product: true,
        vehicle: {
          select: {
            vin: true,
            color: true
          }
        }
      }
    },
    payments: true,
  }
}>

export interface SaleItem extends Omit<SaleItemPrisma, 'sale_id' | 'unit_price'> {
  sale_id?: string;
  unit_price: number | Prisma.Decimal;
  product_name: string;
  tracking_type: string;
  vin?: string;  // Add vin property for SERIAL tracking items
}

export interface Payment {
  id: string;
  sale_id: string;
  amount: number;
  method: string;
  notes: string | null;
  created_at: Date;
}
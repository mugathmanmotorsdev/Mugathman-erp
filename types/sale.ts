import type { Prisma, SaleItem as SaleItemPrisma } from "@/generated/prisma/client";

export type Sale = Prisma.SaleGetPayload<{ 
  include: { 
    customer: true, 
    user: true,  
    sale_items: {
      include: {
        product: true
      }
    }
  }
}>

export interface SaleItem extends Omit<SaleItemPrisma, 'sale_id' | 'unit_price'> {
  sale_id?: string;
  unit_price: number | Prisma.Decimal;
  location_id: string;
  vehicle_id: string;
  product_name: string;
  tracking_type: string;
  vin?: string;
}
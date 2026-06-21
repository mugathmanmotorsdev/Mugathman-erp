import { StockMovement } from "@/generated/prisma/client";
import type { Product as ProductPrisma } from "@/generated/prisma/client";

export interface Product extends ProductPrisma {
  currentStock: number;
  stock_movements: StockMovement[] | null;
}

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "NEAR_LIMIT";
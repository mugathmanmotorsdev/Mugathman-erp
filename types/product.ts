interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit_price: number;
  currentStock: number;
  reorder_level: number;
  is_active: boolean;
}

type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "NEAR_LIMIT";
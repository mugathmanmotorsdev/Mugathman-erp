import { renderToBuffer } from "@react-pdf/renderer";
import { StockExportPDF } from "./StockExport";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  currentStock: number;
  reorder_level: number;
  tracking_type: string;
}

interface Summary {
  totalStockValue: number;
  lowStockCount: number;
}

export async function generateStockExport(
  products: Product[],
  summary: Summary,
  dateFrom?: string,
  dateTo?: string
) {
  const buffer = await renderToBuffer(
    <StockExportPDF
      products={products}
      totalStockValue={summary.totalStockValue}
      lowStockCount={summary.lowStockCount}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
  return buffer;
}

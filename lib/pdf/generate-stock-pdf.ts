import { renderToBuffer } from "@react-pdf/renderer";
import { StockMovementReportPDF } from "./StockMovementReport";

interface Summary {
  totalMovements: number;
  totalIn: number;
  totalOut: number;
  netStock: number;
}

interface StockMovement {
  id: string;
  quantity: number;
  type: "IN" | "OUT";
  reason: string;
  created_at: string;
  product: { name: string; sku: string; category: string };
  vehicle?: { vin: string; color?: string | null } | null;
  user: { full_name: string };
}

export async function generateStockMovementPDF(
  summary: Summary,
  movements: StockMovement[],
  dateFrom?: string,
  dateTo?: string
) {
  const buffer = await renderToBuffer(
    <StockMovementReportPDF summary={summary} movements={movements} dateFrom={dateFrom} dateTo={dateTo} />
  );
  return buffer;
}

import { renderToBuffer } from "@react-pdf/renderer";
import { SalesExportPDF } from "./SalesExport";

interface SaleItem {
  id: string;
  quantity: number;
  unit_price: number;
  product: { name: string; sku: string };
  vehicle?: { vin: string; color?: string | null } | null;
}

interface Sale {
  id: string;
  sale_number: string;
  created_at: string;
  customer: { full_name: string; phone: string };
  sale_items: SaleItem[];
  payments: { amount: number }[];
  payment_status: "PENDING" | "PARTIALLY_PAID" | "PAID";
  status: string;
}

interface Summary {
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  paidCount: number;
  partiallyPaidCount: number;
  pendingCount: number;
}

export async function generateSalesExport(
  sales: Sale[],
  summary: Summary,
  dateFrom?: string,
  dateTo?: string
) {
  const buffer = await renderToBuffer(
    <SalesExportPDF
      sales={sales}
      totalRevenue={summary.totalRevenue}
      totalPaid={summary.totalPaid}
      totalOutstanding={summary.totalOutstanding}
      paidCount={summary.paidCount}
      partiallyPaidCount={summary.partiallyPaidCount}
      pendingCount={summary.pendingCount}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
  return buffer;
}

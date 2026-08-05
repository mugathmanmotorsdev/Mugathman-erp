import { renderToBuffer } from "@react-pdf/renderer";
import { SalesReportPDF } from "./SalesReport";

interface Summary {
  totalSales: number;
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  paidCount: number;
  partiallyPaidCount: number;
  pendingCount: number;
}

interface Sale {
  id: string;
  sale_number: string;
  created_at: string;
  customer: { full_name: string; phone: string };
  sale_items: {
    id: string;
    quantity: number;
    unit_price: number;
    product: { name: string; sku: string };
    vehicle?: { vin: string; color?: string | null } | null;
  }[];
  payments: { amount: number }[];
  payment_status: "PENDING" | "PARTIALLY_PAID" | "PAID";
  status: string;
}

export async function generateSalesPDF(
  summary: Summary,
  sales: Sale[],
  dateFrom?: string,
  dateTo?: string
) {
  const buffer = await renderToBuffer(
    <SalesReportPDF summary={summary} sales={sales} dateFrom={dateFrom} dateTo={dateTo} />
  );
  return buffer;
}

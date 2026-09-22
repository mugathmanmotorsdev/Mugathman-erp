import { renderToBuffer } from "@react-pdf/renderer";
import {
  RegulatorySalesReportPDF,
  type RegulatorySale,
  type MethodBreakdown,
} from "./RegulatorySalesReport";

interface RegulatorySummary {
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  transactionCount: number;
  methodBreakdown: MethodBreakdown[];
}

export async function generateRegulatorySalesExport(
  sales: RegulatorySale[],
  summary: RegulatorySummary,
  reportRef: string,
  dateFrom?: string,
  dateTo?: string
) {
  const buffer = await renderToBuffer(
    <RegulatorySalesReportPDF
      sales={sales}
      totalRevenue={summary.totalRevenue}
      totalPaid={summary.totalPaid}
      totalOutstanding={summary.totalOutstanding}
      transactionCount={summary.transactionCount}
      methodBreakdown={summary.methodBreakdown}
      dateFrom={dateFrom}
      dateTo={dateTo}
      reportRef={reportRef}
    />
  );
  return buffer;
}

import { renderToBuffer } from "@react-pdf/renderer";
import { LeadsExportPDF } from "./LeadsExport";

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  product_of_interest: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
}

interface Summary {
  totalCount: number;
}

export async function generateLeadsExport(
  leads: Lead[],
  summary: Summary,
  dateFrom?: string,
  dateTo?: string
) {
  const buffer = await renderToBuffer(
    <LeadsExportPDF
      leads={leads}
      totalCount={summary.totalCount}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
  return buffer;
}
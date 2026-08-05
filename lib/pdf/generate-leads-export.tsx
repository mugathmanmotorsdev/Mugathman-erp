import { renderToBuffer } from "@react-pdf/renderer";
import { LeadsExportPDF } from "./LeadsExport";

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string | null;
  product_of_interest: string | null;
  status: "NEW" | "QUALIFIED" | "DISQUALIFIED";
  created_at: string;
}

interface Summary {
  newCount: number;
  qualifiedCount: number;
  disqualifiedCount: number;
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
      newCount={summary.newCount}
      qualifiedCount={summary.qualifiedCount}
      disqualifiedCount={summary.disqualifiedCount}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
  return buffer;
}

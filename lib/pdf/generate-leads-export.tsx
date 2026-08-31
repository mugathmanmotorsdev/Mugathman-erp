import { renderToBuffer } from "@react-pdf/renderer";
import { LeadsExportPDF } from "./LeadsExport";
import { LeadStatus } from "@generated/prisma/client";

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  product_of_interest: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
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
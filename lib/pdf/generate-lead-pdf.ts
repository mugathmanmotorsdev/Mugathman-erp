import { renderToBuffer } from "@react-pdf/renderer";
import { LeadReportPDF } from "./LeadReport";

interface Summary {
  totalLeads: number;
  newCount: number;
  qualifiedCount: number;
  disqualifiedCount: number;
}

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

export async function generateLeadPDF(
  summary: Summary,
  leads: Lead[],
  dateFrom?: string,
  dateTo?: string
) {
  const buffer = await renderToBuffer(
    <LeadReportPDF summary={summary} leads={leads} dateFrom={dateFrom} dateTo={dateTo} />
  );
  return buffer;
}

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { LeadStatus } from "@generated/prisma/client";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
    position: "relative",
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.05,
    zIndex: -1,
  },
  watermarkImage: {
    width: "80%",
    height: "80%",
    objectFit: "contain",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: "column",
    gap: 10,
  },
  logoImage: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  reportTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#150151",
    textTransform: "uppercase",
    textAlign: "right",
  },
  reportMeta: {
    fontSize: 8,
    color: "#475569",
    textAlign: "right",
    marginTop: 4,
  },
  officeAddress: {
    textAlign: "left",
  },
  summarySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    minWidth: 120,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  summaryValueNew: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#64748b",
  },
  summaryValueQualified: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16a34a",
  },
  summaryValueDisqualified: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#150151",
    color: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#334155",
    alignItems: "flex-start",
  },
  col1: { flex: 3, paddingRight: 16 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "center" },
  col4: { flex: 1, textAlign: "center" },
  col5: { flex: 2, textAlign: "left" },
  leadName: {
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  textMuted: {
    fontSize: 8,
    color: "#64748b",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusNew: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
  },
  statusQualified: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusDisqualified: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#150151",
    paddingTop: 20,
    fontSize: 9,
  },
  footerCol: {
    flex: 1,
  },
  footerTitle: {
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    fontSize: 10,
  },
  footerRow: {
    flexDirection: "row",
    marginBottom: 3,
    color: "#64748b",
  },
  footerLabel: {
    fontWeight: "bold",
    color: "#334155",
    width: 50,
  },
  footerValue: {
    color: "#64748b",
  },
});

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string | null;
  product_of_interest: string | null;
  status: LeadStatus;
  created_at: string;
}

interface LeadsExportProps {
  leads: Lead[];
  newCount: number;
  qualifiedCount: number;
  disqualifiedCount: number;
  dateFrom?: string;
  dateTo?: string;
}

export function LeadsExportPDF({
  leads,
  newCount,
  qualifiedCount,
  disqualifiedCount,
  dateFrom,
  dateTo,
}: LeadsExportProps) {
  const logoUrl = getLogoBase64();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "QUALIFIED":
        return styles.statusQualified;
      case "DISQUALIFIED":
        return styles.statusDisqualified;
      default:
        return styles.statusNew;
    }
  };

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.watermarkContainer}>
          <Image src={logoUrl} style={styles.watermarkImage} />
        </View>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logoImage} />
            <Text style={styles.companyName}>Mugathman Motors</Text>
            <View style={styles.officeAddress}>
              <Text style={{ fontSize: 8, color: "#475569" }}>Danladi Nasidit, Housing Estate,</Text>
              <Text style={{ fontSize: 8, color: "#475569" }}>Kumbotso, Kano State, Nigeria</Text>
            </View>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.reportTitle}>Leads Export</Text>
            <Text style={styles.reportMeta}>
              {dateFrom && dateTo
                ? `${new Date(dateFrom).toLocaleDateString()} — ${new Date(dateTo).toLocaleDateString()}`
                : "All Time"}
            </Text>
            <Text style={styles.reportMeta}>Generated: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Leads</Text>
            <Text style={styles.summaryValue}>{leads.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>New</Text>
            <Text style={styles.summaryValueNew}>{newCount}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Qualified</Text>
            <Text style={styles.summaryValueQualified}>{qualifiedCount}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Disqualified</Text>
            <Text style={styles.summaryValueDisqualified}>{disqualifiedCount}</Text>
          </View>
        </View>

        {/* Leads Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Lead</Text>
            <Text style={styles.col2}>Organization</Text>
            <Text style={styles.col3}>Interest</Text>
            <Text style={styles.col4}>Status</Text>
            <Text style={styles.col5}>Date</Text>
          </View>

          {leads.map((lead) => (
            <View key={lead.id} style={styles.tableRow}>
              <View style={styles.col1}>
                <Text style={styles.leadName}>{lead.full_name}</Text>
                <Text style={styles.textMuted}>{lead.email}</Text>
                <Text style={styles.textMuted}>{lead.phone}</Text>
              </View>
              <Text style={styles.col2}>
                {lead.organization ? lead.organization : <Text style={styles.textMuted}>—</Text>}
              </Text>
              <Text style={styles.col3}>
                {lead.product_of_interest ? lead.product_of_interest : <Text style={styles.textMuted}>—</Text>}
              </Text>
              <Text style={styles.col4}>
                <Text style={{ ...styles.statusBadge, ...getStatusStyle(lead.status) }}>
                  {lead.status}
                </Text>
              </Text>
              <Text style={styles.col5}>{new Date(lead.created_at).toLocaleDateString()}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>Questions?</Text>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Email us</Text>
              <Text style={styles.footerValue}> : info@mugathmanmotors.com</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Call us</Text>
              <Text style={styles.footerValue}> : +2348067957545</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBase64 = fs.readFileSync(logoPath).toString("base64");
    return `data:image/png;base64,${logoBase64}`;
  } catch {
    return "";
  }
}

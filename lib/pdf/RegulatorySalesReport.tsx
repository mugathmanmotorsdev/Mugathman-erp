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
import { PaymentStatus, PaymentMethod } from "@generated/prisma/client";
import { Decimal } from "@prisma/client-runtime-utils";

const COMPANY_RC = "RC: 1643911";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
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
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "column",
    gap: 6,
  },
  logoImage: {
    width: 56,
    height: 56,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  companyMeta: {
    fontSize: 8,
    color: "#475569",
  },
  reportTitle: {
    fontSize: 20,
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
  scopeNote: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 16,
    fontStyle: "italic",
  },
  summarySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: 110,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryLabel: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
  },
  methodTable: {
    marginBottom: 16,
  },
  methodHeader: {
    flexDirection: "row",
    backgroundColor: "#150151",
    color: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  methodRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#334155",
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#150151",
    color: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: "#334155",
    alignItems: "flex-start",
  },
  colSn: { width: 24 },
  colDate: { width: 56 },
  colSale: { flex: 2, paddingRight: 8 },
  colCustomer: { flex: 1.4, paddingRight: 8 },
  colItem: { flex: 2.4, paddingRight: 8 },
  colAmounts: { width: 78, textAlign: "right" },
  colPay: { width: 78, textAlign: "right" },
  productName: {
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  textMuted: {
    fontSize: 7,
    color: "#64748b",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#150151",
    paddingTop: 16,
    fontSize: 8,
    color: "#475569",
  },
});

export interface RegulatorySaleItem {
  id: string;
  quantity: number;
  unit_price: number | Decimal;
  product: { name: string; sku: string };
  vehicle?: { vin: string; color?: string | null } | null;
}

export interface RegulatorySale {
  id: string;
  sale_number: string;
  created_at: string;
  customer: { full_name: string };
  sale_items: RegulatorySaleItem[];
  payments: { amount: number | Decimal; method: PaymentMethod; created_at: string }[];
  payment_status: PaymentStatus;
}

export interface MethodBreakdown {
  method: PaymentMethod;
  count: number;
  total: number;
}

interface RegulatoryReportProps {
  sales: RegulatorySale[];
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  transactionCount: number;
  methodBreakdown: MethodBreakdown[];
  dateFrom?: string;
  dateTo?: string;
  reportRef: string;
}

export function RegulatorySalesReportPDF({
  sales,
  totalRevenue,
  totalPaid,
  totalOutstanding,
  transactionCount,
  methodBreakdown,
  dateFrom,
  dateTo,
  reportRef,
}: RegulatoryReportProps) {
  const logoUrl = getLogoBase64();
  const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.watermarkContainer}>
          <Image src={logoUrl} style={styles.watermarkImage} />
        </View>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logoImage} />
            <Text style={styles.companyName}>Mugathman Motors</Text>
            <Text style={styles.companyMeta}>
              Danladi Nasidit, Housing Estate, Kumbotso, Kano State, Nigeria
            </Text>
            <Text style={styles.companyMeta}>{COMPANY_RC}</Text>
          </View>
          <View>
            <Text style={styles.reportTitle}>
              Statutory Sales Report — For Regulatory Compliance
            </Text>
            <Text style={styles.reportMeta}>Ref: {reportRef}</Text>
            <Text style={styles.reportMeta}>
              {dateFrom && dateTo
                ? `Period: ${new Date(dateFrom).toLocaleDateString()} — ${new Date(dateTo).toLocaleDateString()}`
                : "Period: All Time"}
            </Text>
            <Text style={styles.reportMeta}>
              Generated: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        <Text style={styles.scopeNote}>
          Scope: completed sales only. Excludes cancelled/voided transactions.
          Customer contact details withheld for privacy. Selling prices only — no
          cost, profit, supplier or staff performance data included.
        </Text>

        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryValue}>{transactionCount}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Gross Turnover</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Collected</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalPaid)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Outstanding Receivables</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalOutstanding)}
            </Text>
          </View>
        </View>

        <View style={styles.methodTable}>
          <View style={styles.methodHeader}>
            <Text style={{ flex: 2 }}>Payment Method</Text>
            <Text style={{ flex: 1, textAlign: "center" }}>Transactions</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Total NGN</Text>
          </View>
          {methodBreakdown.map((m) => (
            <View key={m.method} style={styles.methodRow}>
              <Text style={{ flex: 2 }}>{m.method.replace(/_/g, " ")}</Text>
              <Text style={{ flex: 1, textAlign: "center" }}>{m.count}</Text>
              <Text style={{ flex: 1, textAlign: "right" }}>
                {m.total.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSn}>S/N</Text>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colSale}>Sale No</Text>
            <Text style={styles.colCustomer}>Customer</Text>
            <Text style={styles.colItem}>Items (SKU / VIN)</Text>
            <Text style={styles.colAmounts}>Total</Text>
            <Text style={styles.colPay}>Paid / Balance</Text>
          </View>

          {sales.map((sale, idx) => {
            const totalAmount = sale.sale_items.reduce(
              (acc, item) => acc + Number(item.unit_price) * item.quantity,
              0
            );
            const paid = sale.payments.reduce(
              (acc, p) => acc + Number(p.amount),
              0
            );
            const outstanding = totalAmount - paid;

            return (
              <View key={sale.id} style={styles.tableRow} wrap={false}>
                <Text style={styles.colSn}>{idx + 1}</Text>
                <Text style={styles.colDate}>
                  {new Date(sale.created_at).toLocaleDateString()}
                </Text>
                <View style={styles.colSale}>
                  <Text style={styles.productName}>{sale.sale_number}</Text>
                  <Text style={styles.textMuted}>{sale.payment_status}</Text>
                </View>
                <View style={styles.colCustomer}>
                  <Text style={{ fontWeight: "bold" }}>
                    {sale.customer.full_name}
                  </Text>
                </View>
                <View style={styles.colItem}>
                  {sale.sale_items.map((item) => (
                    <Text key={item.id} style={styles.textMuted}>
                      {item.product.name}
                      {item.vehicle ? ` — VIN ${item.vehicle.vin}` : ""}
                    </Text>
                  ))}
                </View>
                <Text style={styles.colAmounts}>
                  {totalAmount.toLocaleString()}
                </Text>
                <View style={styles.colPay}>
                  <Text>{paid.toLocaleString()}</Text>
                  <Text style={styles.textMuted}>
                    Bal: {outstanding > 0 ? outstanding.toLocaleString() : "—"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text>
            Certified true record of sales for the stated period. Cancelled
            transactions excluded. Customer contact details withheld for privacy
            in line with data protection requirements. Submitted digitally.
          </Text>
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

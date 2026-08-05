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
  summaryValuePositive: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16a34a",
  },
  summaryValueNegative: {
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
  col5: { flex: 1, textAlign: "center" },
  productName: {
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  textMuted: {
    fontSize: 8,
    color: "#64748b",
  },
  typeBadge: {
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
  typeIn: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  typeOut: {
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

interface StockMovementReportProps {
  summary: {
    totalMovements: number;
    totalIn: number;
    totalOut: number;
    netStock: number;
  };
  movements: StockMovement[];
  dateFrom?: string;
  dateTo?: string;
}

export function StockMovementReportPDF({ summary, movements, dateFrom, dateTo }: StockMovementReportProps) {
  const logoUrl = getLogoBase64();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  const getTypeStyle = (type: string) => {
    return type === "IN" ? styles.typeIn : styles.typeOut;
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
            <Text style={styles.reportTitle}>Stock Movement Report</Text>
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
            <Text style={styles.summaryLabel}>Total Movements</Text>
            <Text style={styles.summaryValue}>{summary.totalMovements}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Stock In</Text>
            <Text style={styles.summaryValuePositive}>{summary.totalIn} units</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Stock Out</Text>
            <Text style={styles.summaryValueNegative}>{summary.totalOut} units</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Stock</Text>
            <Text style={summary.netStock >= 0 ? styles.summaryValuePositive : styles.summaryValueNegative}>
              {summary.netStock > 0 ? "+" : ""}{summary.netStock} units
            </Text>
          </View>
        </View>

        {/* Movements Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Product</Text>
            <Text style={styles.col2}>VIN / Vehicle</Text>
            <Text style={styles.col3}>Type</Text>
            <Text style={styles.col4}>Qty</Text>
            <Text style={styles.col5}>Reason</Text>
          </View>

          {movements.map((movement) => (
            <View key={movement.id} style={styles.tableRow}>
              <View style={styles.col1}>
                <Text style={styles.productName}>{movement.product.name}</Text>
                <Text style={styles.textMuted}>{movement.product.sku}</Text>
              </View>
              <View style={styles.col2}>
                {movement.vehicle ? (
                  <Text style={{ fontWeight: "bold" }}>{movement.vehicle.vin}</Text>
                ) : (
                  <Text style={styles.textMuted}>—</Text>
                )}
                {movement.vehicle?.color && (
                  <Text style={styles.textMuted}>Color: {movement.vehicle.color}</Text>
                )}
              </View>
              <Text style={styles.col3}>
                <Text style={{ ...styles.typeBadge, ...getTypeStyle(movement.type) }}>
                  {movement.type === "IN" ? "Stock In" : "Stock Out"}
                </Text>
              </Text>
              <Text style={styles.col4}>
                {movement.type === "IN" ? "+" : "-"}
                {Math.abs(movement.quantity)}
              </Text>
              <Text style={styles.col5}>{movement.reason}</Text>
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

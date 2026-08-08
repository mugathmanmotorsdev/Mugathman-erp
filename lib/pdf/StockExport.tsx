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
  col1: { flex: 2, paddingRight: 16 },
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
  statusInStock: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusLowStock: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  statusOutOfStock: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
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

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  currentStock: number;
  reorder_level: number;
  tracking_type: string;
}

interface StockExportProps {
  products: Product[];
  totalStockValue: number;
  lowStockCount: number;
  dateFrom?: string;
  dateTo?: string;
}

export function StockExportPDF({
  products,
  totalStockValue,
  lowStockCount,
  dateFrom,
  dateTo,
}: StockExportProps) {
  const logoUrl = getLogoBase64();

  const formatCurrency = (amount: number) =>
    `NGN ${amount}`;

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return "OUT_OF_STOCK";
    if (product.currentStock <= product.reorder_level * 0.5) return "LOW_STOCK";
    return "IN_STOCK";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "IN_STOCK":
        return styles.statusInStock;
      case "LOW_STOCK":
        return styles.statusLowStock;
      default:
        return styles.statusOutOfStock;
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
            <Text style={styles.reportTitle}>Stock Export</Text>
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
            <Text style={styles.summaryLabel}>Total Products</Text>
            <Text style={styles.summaryValue}>{products.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Stock Value</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalStockValue)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Low Stock Alerts</Text>
            <Text style={lowStockCount > 0 ? styles.summaryValueNegative : styles.summaryValuePositive}>
              {lowStockCount}
            </Text>
          </View>
        </View>

        {/* Products Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Product</Text>
            <Text style={styles.col2}>SKU</Text>
            <Text style={styles.col3}>Category</Text>
            <Text style={styles.col4}>Stock</Text>
            <Text style={styles.col5}>Status</Text>
          </View>

          {products.map((product) => {
            const status = getStockStatus(product);
            return (
              <View key={product.id} style={styles.tableRow}>
                <View style={styles.col1}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.textMuted}>{product.tracking_type} tracking</Text>
                </View>
                <Text style={styles.col2}>{product.sku}</Text>
                <Text style={styles.col3}>{product.category.replace("_", " ")}</Text>
                <Text style={styles.col4}>
                  <Text
                    style={
                      status === "LOW_STOCK" || status === "OUT_OF_STOCK"
                        ? styles.statusLowStock
                        : styles.statusInStock
                    }
                  >
                    {product.currentStock}
                  </Text>
                </Text>
                <Text style={styles.col5}>
                  <Text style={{ ...styles.statusBadge, ...getStatusStyle(status) }}>
                    {status === "IN_STOCK" ? "In Stock" : status === "LOW_STOCK" ? "Low Stock" : "Out of Stock"}
                  </Text>
                </Text>
              </View>
            );
          })}
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

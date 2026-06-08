import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Sale } from "@/types/sale";

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
    marginBottom: 40,
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
  customerInfo: {
    marginTop: 20,
    flexDirection: "column",
    gap: 5,
    color: "#475569",
  },
  boldText: {
    fontWeight: "bold",
    color: "#1e293b",
  },
  normalText: {
    fontWeight: "normal",
  },
  receiptTitleContainer: {
    textAlign: "right",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 20,
    marginTop: 30,
  },
  receiptTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#150151",
    textTransform: "uppercase",
  },
  officeAddress: {
    textAlign: "left",
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#150151",
    color: "#ffffff",
    paddingHorizontal: 15,
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#334155",
    alignItems: "flex-start",
  },
  col1: { flex: 3, paddingRight: 20 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "center" },
  col4: { flex: 1, textAlign: "right" },
  productName: {
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 40,
  },
  summaryBox: {
    flexDirection: "column",
    width: 200,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 5,
  },
  subtotalLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#475569",
  },
  subtotalValue: {
    fontWeight: "bold",
    color: "#1e293b",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#150151",
    color: "#ffffff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 30,
  },
  signatureBox: {
    width: 150,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    height: 30,
    marginBottom: 5,
  },
  signatureText: {
    textAlign: "center",
    color: "#475569",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
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

export function ReceiptPDF({ sale }: { sale: Sale }) {
  const date = new Date(sale.created_at);

  const subtotal = sale.sale_items.reduce(
    (acc, item) => acc + Number(item.unit_price) * Number(item.quantity),
    0
  );
  const total = subtotal;

  // Ideally, use an absolute URL like http://localhost:3000/logo.png
  // Or path.join(process.cwd(), 'public', 'logo.png')
  // We will leave the logo out if it's too problematic or use a placeholder string.
  // We'll use a placeholder URL for the logo.
  const logoUrl = "http://localhost:3000/logo.png"; 

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
            
            <View style={styles.customerInfo}>
              <Text style={styles.boldText}>
                Name : <Text style={styles.normalText}>{sale.customer.full_name}</Text>
              </Text>
              <Text style={styles.boldText}>
                Phone : <Text style={styles.normalText}>{sale.customer.phone}</Text>
              </Text>
              <Text style={styles.boldText}>
                Date :{" "}
                <Text style={styles.normalText}>
                  {date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.receiptTitleContainer}>
            <Text style={styles.receiptTitle}>Receipt</Text>
            <View style={styles.officeAddress}>
              <Text style={styles.boldText}>Office Address</Text>
              <Text>Danladi Nasidit, Housing Estate,</Text>
              <Text>Kumbotso, Kano State, Nigeria</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Items Description</Text>
            <Text style={styles.col2}>Unit Price</Text>
            <Text style={styles.col3}>Qnt</Text>
            <Text style={styles.col4}>Total</Text>
          </View>

          {sale.sale_items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.col1}>
                <Text style={styles.productName}>{item.product.name}</Text>
              </View>
              <Text style={styles.col2}>{Number(item.unit_price).toLocaleString()}</Text>
              <Text style={styles.col3}>{Number(item.quantity)}</Text>
              <Text style={styles.col4}>
                {(Number(item.unit_price) * Number(item.quantity)).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal: </Text>
              <Text style={styles.subtotalValue}>{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Due:</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureText}>Customer Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureText}>Authorized Signature</Text>
          </View>
        </View>

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

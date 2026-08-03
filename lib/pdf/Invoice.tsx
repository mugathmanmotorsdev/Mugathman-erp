import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer"
import { Invoice } from "@/types/invoice"
import fs from "fs"
import path from "path"
import { number } from "zod"

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
  invoiceTitleContainer: {
    textAlign: "right",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 20,
    marginTop: 30,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#150151",
    textTransform: "uppercase",
  },
  officeAddress: {
    textAlign: "left",
  },
  invoiceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  metaBox: {
    flexDirection: "column",
    gap: 5,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#475569",
  },
  metaValue: {
    fontWeight: "bold",
    color: "#1e293b",
    fontSize: 10,
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
  signatureImage: {
    width: 150,
    height: 50,
    objectFit: "contain",
    marginBottom: 5,
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
  statusBadge: {
    alignSelf: "flex-start",
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusCancelled: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
})

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  const date = new Date(invoice.created_at)

  const subtotal = invoice.items.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: number, item: any) => acc + Number(item.unit_price) * Number(item.quantity),
    0
  )
  const total = subtotal

  let logoUrl = ""
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png")
    const logoBase64 = fs.readFileSync(logoPath).toString("base64")
    logoUrl = `data:image/png;base64,${logoBase64}`
  } catch {
    // Image not available
  }

  // Read authorize signature as base64 data URI
  let signatureUrl = ""
  try {
    const signaturePath = path.join(process.cwd(), "public", "signature.png")
    const signatureBase64 = fs.readFileSync(signaturePath).toString("base64")
    signatureUrl = `data:image/png;base64,${signatureBase64}`
  } catch {
    // Signature image not available
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PAID":
        return styles.statusPaid
      case "CANCELLED":
        return styles.statusCancelled
      default:
        return styles.statusPending
    }
  }

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.watermarkContainer}>
          <Image src={logoUrl} style={styles.watermarkImage} alt="" />
        </View>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logoImage} alt="" />
            <Text style={styles.companyName}>Mugathman Motors</Text>

            <View style={styles.customerInfo}>
              <Text style={styles.boldText}>
                Name: <Text style={styles.normalText}>{invoice.customer.full_name}</Text>
              </Text>
              <Text style={styles.boldText}>
                Phone: <Text style={styles.normalText}>{invoice.customer.phone}</Text>
              </Text>
              {invoice.customer.email && (
                <Text style={styles.boldText}>
                  Email:{" "}
                  <Text style={styles.normalText}>{invoice.customer.email}</Text>
                </Text>
              )}
            </View>
          </View>

          <View style={styles.invoiceTitleContainer}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <View style={styles.officeAddress}>
              <Text style={styles.boldText}>Mugathman Motors</Text>
              <Text>Danladi Nasidit, Housing Estate,</Text>
              <Text>Kumbotso, Kano State, Nigeria</Text>
            </View>
          </View>
        </View>

        <View style={styles.invoiceMeta}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Invoice Number</Text>
            <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>
              {date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={{ ...styles.statusBadge, ...getStatusStyle(invoice.status) }}>{invoice.status}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Item Description</Text>
            <Text style={styles.col2}>Unit Price</Text>
            <Text style={styles.col3}>Qty</Text>
            <Text style={styles.col4}>Total</Text>
          </View>

          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.col1}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={{ fontSize: 8, color: "#64748b" }}>{item.product.sku}</Text>
              </View>
              <Text style={styles.col2}>
                {Number(item.unit_price).toLocaleString()}
              </Text>
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
              <Text style={styles.subtotalLabel}>Subtotal:</Text>
              <Text style={styles.subtotalValue}>{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Image src={signatureUrl} style={styles.signatureImage} alt="" />
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
  )
}

import { renderToBuffer } from "@react-pdf/renderer"
import { InvoicePDF } from "./Invoice"
import { Invoice } from "@/types/invoice"

export async function generateInvoicePDF(invoice: Invoice) {
  const buffer = await renderToBuffer(<InvoicePDF invoice={invoice as Invoice} />)
  return buffer
}

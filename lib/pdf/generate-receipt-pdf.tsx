import { renderToBuffer } from "@react-pdf/renderer"
import { ReceiptPDF } from "./Receipt"
import { Sale } from "@/types/sale"

export async function generateReceiptPDF(sale: Sale) {
    const buffer = await renderToBuffer(<ReceiptPDF sale={sale as any} />)
    return buffer
}
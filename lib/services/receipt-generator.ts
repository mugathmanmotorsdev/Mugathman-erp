import { chromium } from "playwright";

export async function generateReceipt(saleId: string) {
    const browser = await chromium.launch()
    const page = await browser.newPage()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment.");
    }
    const url = `${baseUrl}/receipt/${saleId}`

    await page.goto(url, { waitUntil: 'networkidle' })

    const pdf = await page.pdf({
        format: 'A5',
        printBackground: true,
        margin: {
            top: '10mm',
            bottom: '10mm',
            left: '0mm',
            right: '0mm'
        }
    })

    await browser.close()

    return pdf
}
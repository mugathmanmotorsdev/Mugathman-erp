import { NextResponse } from 'next/server'
import { chromium } from 'playwright'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const saleId = searchParams.get('saleId')

    if (!saleId) {
        return NextResponse.json({ error: 'Missing saleId' }, { status: 400 })
    }

    const browser = await chromium.launch()
    const page = await browser.newPage()

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/receipt`

    await page.goto(url, { waitUntil: 'networkidle' })

    const pdf = await page.pdf({
        format: 'A5',
        printBackground: true,
        margin: {
            top: '10mm',
            bottom: '10mm',
        }
    })

    await browser.close()

    return new NextResponse(pdf as any, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="receipt-${saleId}.pdf"`,
        },
    })
}
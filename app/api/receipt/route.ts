import { NextResponse, NextRequest } from 'next/server'
import { generateReceipt } from '@/lib/services/receipt-generator'  
import { getSale } from '@/lib/actions/sales'

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const saleId = searchParams.get('saleId')

    // check if saleId is valid
    if (!saleId) {
        return NextResponse.json({ error: 'Missing saleId' }, { status: 400 })
    }

    // get sale
    const sale = await getSale(saleId)
    // check if sale is found
    if (!sale) {
        return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    // generate pdf
    const pdfBuffer = await generateReceipt(saleId)

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="receipt-${saleId}.pdf"`,
        },
    })
}
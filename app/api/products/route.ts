import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSKU } from "@/lib/utils/sku-generator";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const skip = searchParams.get("skip")
    const take = searchParams.get("take")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    
    try {
        const where: any = {}
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ]
        }
        if (category && category !== 'all') {
            where.category = category
        }

        const products = await prisma.product.findMany({
            where,
            skip: skip ? parseInt(skip) : 0,
            take: take ? parseInt(take) : 10,
            include: {
                stock_movements: {
                    select: {
                        quantity: true,
                        reason: true
                    }
                }
            }
        })

        const productsWithStock = products.map(p => {
            const currentStock = p.stock_movements.reduce((acc, mov) => {
                // In this simplified model, we'll assume quantity is already signed or 
                // we treat PURCHASE as positive and SALE/DAMAGE as negative.
                // Let's check prisma schema again: StockMovementReason { PURCHASE, SALE, DAMAGE, ADJUSTMENT }
                if (mov.reason === 'PURCHASE') return acc + mov.quantity
                if (mov.reason === 'SALE' || mov.reason === 'DAMAGE') return acc - mov.quantity
                return acc + mov.quantity // for ADJUSTMENT, we'll assume it's the delta
            }, 0)
            return {
                ...p,
                currentStock,
                stock_movements: undefined // remove movements from output to keep it clean
            }
        })

        const totalCount = await prisma.product.count({ where })

        return NextResponse.json({ 
            products: productsWithStock, 
            pagination: {
                total: totalCount,
                skip: skip ? parseInt(skip) : 0,
                take: take ? parseInt(take) : 10
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, sku, category, unit, reorder_level, is_active, description, unit_price, tracking_type } = body || {}
        if (!name || !category || !unit || !unit_price || !tracking_type) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }
        
        const existingProduct = await prisma.product.findUnique({
            where: {
                sku: sku
            }
        })
        
        if (existingProduct) {
            return NextResponse.json(
                { error: "Product already exists" },
                { status: 400 }
            )
        }
        
        let generatedSku = sku
        if (!sku) {
            generatedSku = generateSKU(name, category)
        }

        const product = await prisma.product.create({
            data: {
                name,
                sku: generatedSku,
                category,
                description,
                unit_price: unit_price ? parseFloat(unit_price) : 0,
                unit,
                tracking_type: tracking_type || 'BATCH',
                reorder_level: reorder_level ? parseInt(reorder_level) : 0,
                is_active: is_active ?? true
            }
        })
        
        return NextResponse.json({ product }, { status: 201 })
    } catch (error) {
        console.error("Error creating product:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        )
    }
}

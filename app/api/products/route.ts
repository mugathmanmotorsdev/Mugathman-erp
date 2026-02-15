import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { generateSKU } from "@/lib/utils/sku-generator";
import { requireAuth, roleGuard } from "@/lib/utils/auth-utils";

export async function GET(request: NextRequest) {
    try {
        await requireAuth();

        const searchParams = request.nextUrl.searchParams
        const skip = searchParams.get("skip")
        const take = searchParams.get("take")
        const search = searchParams.get("search")
        const category = searchParams.get("category") 

        const where: Prisma.ProductWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                    { sku: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                ]
            }),
            ...(category && category !== 'all' && { category: category as Prisma.EnumCategoryFilter })
        }

        const products = await prisma.product.findMany({
            where,
            skip: skip ? parseInt(skip) : undefined,
            take: take ? parseInt(take) : undefined,
            include: {
                stock_movements: {
                    select: {
                        quantity: true,
                        type: true,
                        reason: true
                    }
                }
            }
        })

        const productsWithStock = products.map((p) => {
            const currentStock = (p.stock_movements || []).reduce((acc: number, mov) => {
                return mov.type === 'IN' ? acc + mov.quantity : acc - mov.quantity
            }, 0)
            
            return {
                ...p,
                unit_price: Number(p.unit_price),
                currentStock,
                stock_movements: null
            }
        })

        const totalCount = await prisma.product.count({ where })

        return NextResponse.json({ 
            products: productsWithStock, 
            pagination: {
                total: totalCount,
                skip: skip ? parseInt(skip) : undefined,
                take: take ? parseInt(take) : undefined
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
        const user = await requireAuth();
        await roleGuard(user, ["ADMIN", "EDITOR"])

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

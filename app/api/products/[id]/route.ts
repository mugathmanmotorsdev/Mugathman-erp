import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                stock_movements: {
                    select: {
                        quantity: true,
                        type: true,
                        reason: true
                    }
                }
            }
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const currentStock = product.stock_movements.reduce((acc, mov) => {
            return mov.type === 'IN' ? acc + mov.quantity : acc - mov.quantity
        }, 0);

        return NextResponse.json({ 
            product: {
                ...product,
                unit_price: Number(product.unit_price),
                currentStock,
                stock_movements: null
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, sku, category, unit, reorder_level, is_active, description, unit_price, tracking_type } = body || {};

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(sku !== undefined && { sku }),
                ...(category !== undefined && { category }),
                ...(description !== undefined && { description }),
                ...(unit_price !== undefined && { unit_price: parseFloat(unit_price) }),
                ...(unit !== undefined && { unit }),
                ...(tracking_type !== undefined && { tracking_type }),
                ...(reorder_level !== undefined && { reorder_level: parseInt(reorder_level) }),
                ...(is_active !== undefined && { is_active })
            }
        });

        return NextResponse.json({ product }, { status: 200 });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                stock_movements: true,
                sale_items: true,
                vehicles: true
            }
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Check for dependencies
        if (product.stock_movements.length > 0 || product.sale_items.length > 0 || product.vehicles.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete product with existing stock movements, sales, or vehicles" },
                { status: 409 }
            );
        }

        await prisma.product.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

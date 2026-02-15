import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await requireAuth();

        // 1. Get total products
        const totalProducts = await prisma.product.count({
            where: { is_active: true }
        });

        // 2. Get total customers
        const totalCustomers = await prisma.customer.count();

        // 3. Get recent sales (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSales = await prisma.sale.findMany({
            where: {
                created_at: { gte: thirtyDaysAgo }
            },
            include: {
                sale_items: true
            }
        });

        const totalRevenue = recentSales.reduce((acc, sale) => {
            return acc + sale.sale_items.reduce((itemAcc, item) => {
                return itemAcc + (item.quantity * Number(item.unit_price));
            }, 0);
        }, 0);

        // comparison with with previous month
        const lastMonthAgo = new Date();
        lastMonthAgo.setDate(lastMonthAgo.getDate() - 60);

        const lastMonthSales = await prisma.sale.findMany({
            where: {
                created_at: { gte: lastMonthAgo, lte: thirtyDaysAgo }
            },
            include: {
                sale_items: true
            }
        });

        const lastMonthRevenue = lastMonthSales.reduce((acc, sale) => {
            return acc + sale.sale_items.reduce((itemAcc, item) => {
                return itemAcc + (item.quantity * Number(item.unit_price));
            }, 0);
        }, 0);

        const revenueGrowth = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        // 4. Low stock items (less than reorder level)
        // We need to calculate current stock for each product
        const productsWithStockMovements = await prisma.product.findMany({
            where: { is_active: true },
            select: {
                id: true,
                name: true,
                reorder_level: true,
                stock_movements: {
                    select: { quantity: true }
                }
            }
        });

        const lowStockItems = productsWithStockMovements.filter(p => {
            const currentStock = p.stock_movements.reduce((acc, mov) => acc + mov.quantity, 0);
            return currentStock <= p.reorder_level;
        }).length;

        // 5. Recent Activity (latest sales and movements)
        const activities = await Promise.all([
            prisma.sale.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { customer: true }
            }).then(sales => sales.map(s => ({
                id: s.id,
                type: 'SALE',
                title: `Sale to ${s.customer.full_name}`,
                description: `Order #${s.sale_number}`,
                time: s.created_at
            }))),
            prisma.stockMovement.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { product: true }
            }).then(movs => movs.map(m => ({
                id: m.id,
                type: 'MOVEMENT',
                title: `${m.type} Movement: ${m.product.name}`,
                description: `${m.quantity} units ${m.type === 'IN' ? 'added' : 'removed'}`,
                time: m.created_at
            })))
        ]);

        const recentActivity = [...activities[0], ...activities[1]]
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, 5);

        return NextResponse.json({
            stats: {
                totalProducts,
                totalCustomers,
                totalRevenue,
                lowStockItems,
                revenueGrowth
            },
            recentActivity
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

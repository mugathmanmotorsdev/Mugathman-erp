import prisma from "@/lib/prisma";

export const getSales = async (skip = 0, take = 100) => {
    return await prisma.sale.findMany({
        include: {
            customer: true,
            user: {
                select: {
                    full_name: true
                }
            },
            sale_items: {
                include: {
                    product: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        },
        skip,
        take
    });
};

export const getSale = async (id: string) => {
    return await prisma.sale.findUnique({
        where: { id },
        include: {
            customer: true,
            user: {
                select: {
                    full_name: true
                }
            },
            sale_items: {
                include: {
                    product: true
                }
            }
        }
    });
};
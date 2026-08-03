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
                    product: true,
                    vehicle: {
                        select: {
                            vin: true,
                            color: true,
                        },
                    },
                }
            },
            payments: true,
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
                    product: true,
                    vehicle: {
                        select: {
                            vin: true,
                            color: true,
                        },
                    },
                }
            },
            payments: {
                orderBy: {
                    created_at: 'desc'
                }
            }
        }
    });
};

export const createPayment = async (saleId: string, amount: number, method: string, notes?: string) => {
    return await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
            where: { id: saleId },
            include: { payments: true, sale_items: { include: { product: true } } },
        });

        if (!sale) {
            throw new Error("Sale not found");
        }

        const totalPaid = sale.payments.reduce((acc: number, p) => acc + Number(p.amount), 0);
        const totalAmount = sale.sale_items.reduce(
            (acc: number, item: any) => acc + Number(item.product?.unit_price || 0) * item.quantity,
            0
        );
        const newTotalPaid = totalPaid + amount;

        if (newTotalPaid > totalAmount) {
            throw new Error("Payment amount exceeds outstanding balance");
        }

        const payment = await tx.payment.create({
            data: {
                sale_id: saleId,
                amount: amount,
                method: method as any,
                notes: notes || null,
            },
        });

        const paymentStatus = newTotalPaid >= totalAmount ? "PAID" : "PARTIALLY_PAID";

        await tx.sale.update({
            where: { id: saleId },
            data: { payment_status: paymentStatus },
        });

        return payment;
    });
};

export const getPaymentsBySale = async (saleId: string) => {
    return await prisma.payment.findMany({
        where: { sale_id: saleId },
        orderBy: { created_at: 'desc' },
    });
};
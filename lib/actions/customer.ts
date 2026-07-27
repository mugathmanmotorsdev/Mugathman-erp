import prisma from "@/lib/prisma";

export async function findOrCreateCustomer(details: {
    full_name: string;
    phone: string;
    email?: string;
    address?: string;
}) {
    const existing = await prisma.customer.findUnique({
        where: { phone: details.phone },
    });

    if (existing) {
        return existing;
    }

    return await prisma.customer.create({
        data: {
            full_name: details.full_name,
            phone: details.phone,
            email: details.email ?? null,
            address: details.address ?? null,
        },
    });
}

export async function getCustomers(skip = 0, take = 100) {
    return await prisma.customer.findMany({
        orderBy: { full_name: "asc" },
        skip,
        take,
    });
}

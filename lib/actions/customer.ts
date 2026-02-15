import prisma from "../prisma"

export async function getCustomerBySaleId(saleId: string) {
    const customer = await prisma.customer.findUnique({
        where: {
            id: saleId
        }
    })
    return customer
}   
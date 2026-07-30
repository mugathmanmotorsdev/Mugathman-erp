import prisma from "@/lib/prisma"

export const getInvoices = async (skip = 0, take = 100) => {
  return await prisma.invoice.findMany({
    include: {
      customer: true,
      user: {
        select: {
          full_name: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    skip,
    take,
  })
}

export const getInvoice = async (id: string) => {
  return await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      user: {
        select: {
          full_name: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

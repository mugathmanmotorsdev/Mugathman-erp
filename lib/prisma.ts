import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"

const globalPrisma = global as unknown as {
    prisma: PrismaClient
}

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = globalPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalPrisma.prisma = prisma

export default prisma
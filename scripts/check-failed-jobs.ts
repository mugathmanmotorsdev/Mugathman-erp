import prisma from '../lib/prisma'

async function main() {
    const failedJobs = await prisma.job.findMany({
        where: { status: 'FAILED' },
        orderBy: { createdAt: 'desc' },
        take: 5
    })
    console.log(JSON.stringify(failedJobs, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

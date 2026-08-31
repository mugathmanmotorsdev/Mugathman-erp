import prisma from "@/lib/prisma";
import { Lead } from "@/types/lead";
import { AppError } from "@/lib/utils/app-error";

export async function getLeads(skip = 0, take = 100) {
  return await prisma.lead.findMany({
    orderBy: { created_at: "desc" },
    skip,
    take,
  });
}

export async function getLead(id: string) {
  return await prisma.lead.findUnique({
    where: { id },
  });
}

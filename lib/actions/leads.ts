import prisma from "@/lib/prisma";
import { Lead } from "@/types/lead";
import { AppError } from "@/lib/utils/app-error";
import { LeadStatus } from "@generated/prisma/client";

export async function getLeads(skip = 0, take = 100, status?: LeadStatus) {
  const where = status ? { status } : {};

  return await prisma.lead.findMany({
    where,
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

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<Lead> {
  const lead = await prisma.lead.update({
    where: { id },
    data: { status },
  });

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  return lead;
}

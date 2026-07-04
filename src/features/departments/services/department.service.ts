import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function getDepartments(companyId: string) {
  return prisma.department.findMany({
    where: { companyId },
    include: {
      manager: {
        include: {
          user: { select: { name: true, image: true } }
        }
      },
      _count: {
        select: { employees: true }
      }
    },
    orderBy: { name: "asc" }
  });
}

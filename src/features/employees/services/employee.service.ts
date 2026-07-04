import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function getEmployees(userRole: Role, userEmployeeId?: string) {
  if (userRole === "EMPLOYEE") {
    return prisma.employee.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { name: true, email: true, image: true, role: true } },
        department: { select: { name: true } },
      },
      orderBy: { user: { name: "asc" } },
    });
  }
  
  if (userRole === "MANAGER" && userEmployeeId) {
    return prisma.employee.findMany({
      where: { 
        OR: [
          { managerId: userEmployeeId },
          { id: userEmployeeId }
        ],
        status: "ACTIVE"
      },
      include: {
        user: { select: { name: true, email: true, image: true, role: true } },
        department: { select: { name: true } },
      },
      orderBy: { user: { name: "asc" } },
    });
  }

  return prisma.employee.findMany({
    include: {
      user: { select: { name: true, email: true, image: true, role: true } },
      department: { select: { name: true } },
      manager: { include: { user: { select: { name: true } } } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

import type { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: AuditLogInput) {
  return prisma.auditLog.create({ data: input });
}

export async function getAuditLogs(options: {
  page?: number;
  limit?: number;
  entity?: string;
  userId?: string;
}) {
  const { page = 1, limit = 20, entity, userId } = options;
  const skip = (page - 1) * limit;

  const where = {
    ...(entity && { entity }),
    ...(userId && { userId }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

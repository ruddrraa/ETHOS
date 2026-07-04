"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac/permissions";
import { createAuditLog } from "@/lib/services/audit.service";
import { createBulkNotifications } from "@/lib/services/notification.service";
import type { Role } from "@prisma/client";
import {
  createPayrollRunSchema,
  processPayrollRunSchema,
  salaryStructureSchema,
} from "@/features/payroll/schemas/payroll.schema";
import {
  createPayrollRun,
  processPayrollRun,
  upsertSalaryStructure,
  deletePayrollRun,
} from "@/features/payroll/services/payroll.service";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthorizedUser(permission: Parameters<typeof hasPermission>[1]) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "You must be signed in" } as const;
  }
  if (!hasPermission(user.role as Role, permission)) {
    return { error: "You do not have permission to perform this action" } as const;
  }
  return { user } as const;
}

export async function createPayrollRunAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await getAuthorizedUser("payroll:manage");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  const parsed = createPayrollRunSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const run = await createPayrollRun(parsed.data);

    await createAuditLog({
      userId: auth.user.id,
      action: "CREATE",
      entity: "PayrollRun",
      entityId: run.id,
      details: `Created payroll run: ${run.title}`,
    });

    revalidatePath("/payroll");
    return { success: true, data: { id: run.id } };
  } catch {
    return { success: false, error: "Failed to create payroll run" };
  }
}

export async function processPayrollRunAction(
  input: unknown
): Promise<ActionResult<{ id: string; employeeCount: number }>> {
  const auth = await getAuthorizedUser("payroll:process");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  const parsed = processPayrollRunSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const result = await processPayrollRun(parsed.data.payrollRunId);
    if (!result) {
      return { success: false, error: "Failed to process payroll run" };
    }

    const userIds = result.payslips
      .map((p) => p.employee.user.id)
      .filter(Boolean);

    if (userIds.length > 0) {
      await createBulkNotifications(userIds, {
        title: "New Payslip Available",
        message: `Your payslip for ${result.title} has been generated.`,
        type: "PAYROLL",
        link: "/payroll",
      });
    }

    await createAuditLog({
      userId: auth.user.id,
      action: "UPDATE",
      entity: "PayrollRun",
      entityId: result.id,
      details: `Processed payroll run: ${result.title} for ${result.employeeCount} employees`,
    });

    revalidatePath("/payroll");
    revalidatePath(`/payroll/${result.id}`);
    return {
      success: true,
      data: { id: result.id, employeeCount: result.employeeCount },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process payroll run";
    return { success: false, error: message };
  }
}

export async function upsertSalaryStructureAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await getAuthorizedUser("payroll:manage");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  const parsed = salaryStructureSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const structure = await upsertSalaryStructure(parsed.data);

    await createAuditLog({
      userId: auth.user.id,
      action: "UPDATE",
      entity: "SalaryStructure",
      entityId: structure.id,
      details: `Updated salary structure for employee ${parsed.data.employeeId}`,
    });

    revalidatePath("/payroll");
    return { success: true, data: { id: structure.id } };
  } catch {
    return { success: false, error: "Failed to save salary structure" };
  }
}

export async function deletePayrollRunAction(id: string): Promise<ActionResult> {
  const auth = await getAuthorizedUser("payroll:manage");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  if (!id) {
    return { success: false, error: "Payroll run ID is required" };
  }

  try {
    await deletePayrollRun(id);

    await createAuditLog({
      userId: auth.user.id,
      action: "DELETE",
      entity: "PayrollRun",
      entityId: id,
      details: `Deleted payroll run ${id}`,
    });

    revalidatePath("/payroll");
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete payroll run";
    return { success: false, error: message };
  }
}

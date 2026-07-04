"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/guards";
import { hasPermission, type Permission } from "@/lib/rbac/permissions";
import { createAuditLog } from "@/lib/services/audit.service";
import type { Role } from "@prisma/client";
import { createEmployeeSchema, updateEmployeeSchema } from "@/features/employees/schemas/employee.schema";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { generateEmployeeId } from "@/lib/utils";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthorizedUser(permission: string) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "You must be signed in" } as const;
  }
  if (!hasPermission(user.role as Role, permission as Permission)) {
    return { error: "You do not have permission to perform this action" } as const;
  }
  return { user } as const;
}

export async function createEmployeeAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await getAuthorizedUser("employees:create");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  const parsed = createEmployeeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const { password, name, email, role, baseSalary, ...employeeData } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Email already in use" };
    }

    const hashedPassword = await hash(password, 12);
    
    const company = await prisma.company.findFirst({ include: { settings: true } });
    if (!company) throw new Error("No company configured");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        employee: {
          create: {
            ...employeeData,
            employeeId: generateEmployeeId(),
            companyId: company.id,
            ...(baseSalary !== undefined && {
              salaryStructure: {
                create: {
                  baseSalary: baseSalary,
                  effectiveFrom: new Date(),
                }
              }
            }),
            leaveBalances: {
              create: [
                { leaveType: "ANNUAL", totalDays: company.settings?.annualLeaveDays || 20, year: new Date().getFullYear() },
                { leaveType: "SICK", totalDays: company.settings?.sickLeaveDays || 10, year: new Date().getFullYear() },
                { leaveType: "CASUAL", totalDays: company.settings?.casualLeaveDays || 5, year: new Date().getFullYear() }
              ]
            }
          }
        }
      },
      include: { employee: true }
    });

    if (!user.employee) throw new Error("Failed to create employee profile");

    await createAuditLog({
      userId: auth.user.id,
      action: "CREATE",
      entity: "Employee",
      entityId: user.employee.id,
      details: `Created employee: ${name}`,
    });

    revalidatePath("/employees");
    return { success: true, data: { id: user.employee.id } };
  } catch (error) {
    console.error("[CREATE_EMPLOYEE]", error);
    return { success: false, error: "Failed to create employee" };
  }
}

export async function updateEmployeeAction(
  employeeId: string,
  input: unknown
): Promise<ActionResult> {
  const auth = await getAuthorizedUser("employees:update");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  const parsed = updateEmployeeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const { name, email, role, ...employeeData } = parsed.data;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true }
    });

    if (!employee) return { success: false, error: "Employee not found" };

    // Update user if needed
    if (name || email || role) {
      await prisma.user.update({
        where: { id: employee.userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),
        }
      });
    }

    // Process department setting to null properly
    const dataToUpdate = { ...employeeData };
    if (dataToUpdate.departmentId === "") {
        dataToUpdate.departmentId = null;
    }

    // Update employee
    await prisma.employee.update({
      where: { id: employeeId },
      data: dataToUpdate
    });

    await createAuditLog({
      userId: auth.user.id,
      action: "UPDATE",
      entity: "Employee",
      entityId: employeeId,
      details: `Updated employee profile`,
    });

    revalidatePath(`/employees/${employeeId}`);
    revalidatePath("/employees");
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[UPDATE_EMPLOYEE]", error);
    return { success: false, error: "Failed to update employee" };
  }
}

export async function deleteEmployeeAction(
  employeeId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedUser("employees:delete");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) return { success: false, error: "Employee not found" };

    await prisma.user.delete({
      where: { id: employee.userId }
    }); // This will cascade and delete the employee record

    await createAuditLog({
      userId: auth.user.id,
      action: "DELETE",
      entity: "Employee",
      entityId: employeeId,
      details: `Deleted employee and associated user`,
    });

    revalidatePath("/employees");
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[DELETE_EMPLOYEE]", error);
    return { success: false, error: "Failed to delete employee" };
  }
}

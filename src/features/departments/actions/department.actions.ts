"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/guards";
import { hasPermission, type Permission } from "@/lib/rbac/permissions";
import { createAuditLog } from "@/lib/services/audit.service";
import type { Role } from "@prisma/client";
import { createDepartmentSchema, updateDepartmentSchema } from "@/features/departments/schemas/department.schema";
import { prisma } from "@/lib/prisma";

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

export async function createDepartmentAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await getAuthorizedUser("departments:create");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  const parsed = createDepartmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const company = await prisma.company.findFirst();
    if (!company) throw new Error("No company configured");

    const department = await prisma.department.create({
      data: {
        ...parsed.data,
        companyId: company.id,
      }
    });

    await createAuditLog({
      userId: auth.user.id,
      action: "CREATE",
      entity: "Department",
      entityId: department.id,
      details: `Created department: ${department.name}`,
    });

    revalidatePath("/departments");
    return { success: true, data: { id: department.id } };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create department" };
  }
}

export async function updateDepartmentAction(
  departmentId: string,
  input: unknown
): Promise<ActionResult> {
  const auth = await getAuthorizedUser("departments:update");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  const parsed = updateDepartmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) return { success: false, error: "Department not found" };

    const dataToUpdate = { ...parsed.data };
    if (dataToUpdate.managerId === "") {
        dataToUpdate.managerId = null;
    }

    await prisma.department.update({
      where: { id: departmentId },
      data: dataToUpdate
    });

    await createAuditLog({
      userId: auth.user.id,
      action: "UPDATE",
      entity: "Department",
      entityId: departmentId,
      details: `Updated department: ${department.name}`,
    });

    revalidatePath("/departments");
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[UPDATE_DEPARTMENT]", error);
    return { success: false, error: "Failed to update department" };
  }
}

export async function deleteDepartmentAction(
  departmentId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedUser("departments:delete");
  if ("error" in auth) return { success: false, error: auth.error || "Unauthorized" };

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    if (!department) return { success: false, error: "Department not found" };

    if (department._count.employees > 0) {
      return { success: false, error: "Cannot delete department with active employees. Reassign employees first." };
    }

    await prisma.department.delete({
      where: { id: departmentId }
    });

    await createAuditLog({
      userId: auth.user.id,
      action: "DELETE",
      entity: "Department",
      entityId: departmentId,
      details: `Deleted department: ${department.name}`,
    });

    revalidatePath("/departments");
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[DELETE_DEPARTMENT]", error);
    return { success: false, error: "Failed to delete department" };
  }
}

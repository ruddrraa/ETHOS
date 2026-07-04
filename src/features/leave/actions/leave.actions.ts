"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { applyLeaveSchema, type ApplyLeaveInput } from "@/features/leave/schemas/leave.schema";
import { createAuditLog } from "@/lib/services/audit.service";
import { differenceInBusinessDays, eachDayOfInterval } from "date-fns";
import { sendLeaveApprovalEmail } from "@/lib/services/email.service";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function applyLeaveAction(input: unknown): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || !user.employeeId) {
    return { success: false, error: "Unauthorized or not an employee." };
  }

  const parsed = applyLeaveSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { startDate, endDate, leaveType, reason } = parsed.data;

  // Simple calculation of total days (assuming 1 day minimum, and adding 1 to make it inclusive)
  const totalDays = Math.max(1, differenceInBusinessDays(endDate, startDate) + 1);

  try {
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: user.employeeId,
        startDate,
        endDate,
        leaveType,
        reason,
        totalDays,
        status: "PENDING",
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "LeaveRequest",
      entityId: leaveRequest.id,
      details: `Applied for ${totalDays} days of ${leaveType} leave`,
    });

    revalidatePath("/leave");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to apply for leave." };
  }
}

export async function approveLeaveAction(id: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "HR", "MANAGER"].includes(user.role)) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const leave = await prisma.leaveRequest.findUnique({ 
      where: { id },
      include: { employee: { include: { user: true } } } 
    });
    if (!leave) return { success: false, error: "Leave request not found." };
    if (leave.status !== "PENDING") return { success: false, error: "Leave is not pending." };

    // Transaction to update leave and deduct balance
    await prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id },
        data: { status: "APPROVED", approverId: user.employeeId || undefined, approvedAt: new Date() },
      });

      // Deduct balance
      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveType_year: {
            employeeId: leave.employeeId,
            leaveType: leave.leaveType,
            year: leave.startDate.getFullYear()
          }
        }
      });

      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { usedDays: balance.usedDays + leave.totalDays }
        });
      }

      // Mark Attendance as ON_LEAVE
      const days = eachDayOfInterval({ start: leave.startDate, end: leave.endDate });
      for (const day of days) {
        // skip weekends
        if (day.getDay() !== 0 && day.getDay() !== 6) {
          await tx.attendance.upsert({
            where: { employeeId_date: { employeeId: leave.employeeId, date: day } },
            create: { employeeId: leave.employeeId, date: day, status: "ON_LEAVE", isManual: true },
            update: { status: "ON_LEAVE", isManual: true }
          });
        }
      }
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "LeaveRequest",
      entityId: leave.id,
      details: `Approved leave request`,
    });
    
    // Send email
    if (leave.employee.user.email) {
      await sendLeaveApprovalEmail({
        to: leave.employee.user.email,
        employeeName: leave.employee.user.name || "Employee",
        leaveType: leave.leaveType,
        startDate: leave.startDate.toDateString(),
        endDate: leave.endDate.toDateString(),
        status: "approved"
      });
    }

    revalidatePath("/leave");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to approve leave." };
  }
}

export async function rejectLeaveAction(id: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "HR", "MANAGER"].includes(user.role)) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const leave = await prisma.leaveRequest.findUnique({ 
      where: { id },
      include: { employee: { include: { user: true } } }
    });
    if (!leave) return { success: false, error: "Leave request not found." };
    if (leave.status !== "PENDING") return { success: false, error: "Leave is not pending." };

    await prisma.leaveRequest.update({
      where: { id },
      data: { status: "REJECTED", approverId: user.employeeId || undefined, approvedAt: new Date() },
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "LeaveRequest",
      entityId: leave.id,
      details: `Rejected leave request`,
    });
    
    // Send email
    if (leave.employee.user.email) {
      await sendLeaveApprovalEmail({
        to: leave.employee.user.email,
        employeeName: leave.employee.user.name || "Employee",
        leaveType: leave.leaveType,
        startDate: leave.startDate.toDateString(),
        endDate: leave.endDate.toDateString(),
        status: "rejected"
      });
    }

    revalidatePath("/leave");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to reject leave." };
  }
}

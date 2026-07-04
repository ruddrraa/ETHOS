"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { startOfDay, differenceInMinutes } from "date-fns";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function checkInAction(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || !user.employeeId) {
    return { success: false, error: "Unauthorized or not linked to an employee profile." };
  }

  const today = startOfDay(new Date());

  try {
    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: user.employeeId,
        date: today,
      },
    });

    if (existing && existing.checkIn) {
      return { success: false, error: "You have already checked in today." };
    }

    if (existing) {
      // Update existing record (e.g. if created as ABSENT by a cron job)
      await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: new Date(),
          status: "PRESENT",
        },
      });
    } else {
      // Create new attendance record
      await prisma.attendance.create({
        data: {
          employeeId: user.employeeId,
          date: today,
          checkIn: new Date(),
          status: "PRESENT",
        },
      });
    }

    revalidatePath("/attendance");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to check in." };
  }
}

export async function checkOutAction(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || !user.employeeId) {
    return { success: false, error: "Unauthorized." };
  }

  const today = startOfDay(new Date());

  try {
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: user.employeeId,
        date: today,
      },
    });

    if (!existing || !existing.checkIn) {
      return { success: false, error: "You must check in first." };
    }

    if (existing.checkOut) {
      return { success: false, error: "You have already checked out today." };
    }

    const checkOutTime = new Date();
    const workMinutes = differenceInMinutes(checkOutTime, existing.checkIn);
    const workHours = Math.round((workMinutes / 60) * 100) / 100;

    await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: checkOutTime,
        workHours,
      },
    });

    revalidatePath("/attendance");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to check out." };
  }
}

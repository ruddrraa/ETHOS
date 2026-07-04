import { prisma } from "@/lib/prisma";
import { calculateWorkHours } from "@/lib/utils";
import type { AttendanceStatus, Role } from "@prisma/client";
import {
  endOfMonth,
  endOfDay,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import type {
  AttendanceFilterInput,
  CheckInInput,
  CheckOutInput,
  ManualAttendanceInput,
} from "@/features/attendance/schemas/attendance.schema";

const LATE_THRESHOLD_HOUR = 9;
const LATE_THRESHOLD_MINUTE = 30;

export class AttendanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceError";
  }
}

function toDateOnly(date: Date): Date {
  return startOfDay(date);
}

function determineStatus(checkIn: Date): AttendanceStatus {
  const lateThreshold = new Date(checkIn);
  lateThreshold.setHours(LATE_THRESHOLD_HOUR, LATE_THRESHOLD_MINUTE, 0, 0);
  return checkIn > lateThreshold ? "LATE" : "PRESENT";
}

export interface AttendanceScope {
  role: Role;
  employeeId?: string;
  companyId?: string;
}

async function resolveScopedEmployeeIds(scope: AttendanceScope): Promise<string[] | null> {
  if (!scope.employeeId) return [];

  if (scope.role === "EMPLOYEE") {
    return [scope.employeeId];
  }

  if (scope.role === "MANAGER") {
    const team = await prisma.employee.findMany({
      where: { managerId: scope.employeeId, status: "ACTIVE" },
      select: { id: true },
    });
    return [scope.employeeId, ...team.map((e) => e.id)];
  }

  return null;
}

export async function getTodayAttendance(employeeId: string) {
  const today = toDateOnly(new Date());
  return prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });
}

export async function checkIn(employeeId: string, input: CheckInInput) {
  const today = toDateOnly(new Date());
  const now = new Date();

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });

  if (existing?.checkIn && !existing.checkOut) {
    throw new AttendanceError("You are already checked in for today");
  }

  if (existing?.checkOut) {
    throw new AttendanceError("Attendance for today is already completed");
  }

  const status = determineStatus(now);

  if (existing) {
    return prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkIn: now,
        status,
        location: input.location,
        notes: input.notes ?? existing.notes,
      },
    });
  }

  return prisma.attendance.create({
    data: {
      employeeId,
      date: today,
      checkIn: now,
      status,
      location: input.location,
      notes: input.notes,
    },
  });
}

export async function checkOut(employeeId: string, input: CheckOutInput) {
  const today = toDateOnly(new Date());
  const now = new Date();

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });

  if (!existing?.checkIn) {
    throw new AttendanceError("You must check in before checking out");
  }

  if (existing.checkOut) {
    throw new AttendanceError("You have already checked out for today");
  }

  const workHours = calculateWorkHours(existing.checkIn, now);

  return prisma.attendance.update({
    where: { id: existing.id },
    data: {
      checkOut: now,
      workHours,
      notes: input.notes ?? existing.notes,
    },
  });
}

export async function createManualAttendance(input: ManualAttendanceInput) {
  const date = toDateOnly(input.date);
  const workHours =
    input.checkIn && input.checkOut
      ? calculateWorkHours(input.checkIn, input.checkOut)
      : undefined;

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: input.employeeId, date } },
  });

  if (existing) {
    throw new AttendanceError("Attendance record already exists for this date");
  }

  return prisma.attendance.create({
    data: {
      employeeId: input.employeeId,
      date,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      status: input.status,
      workHours,
      notes: input.notes,
      location: input.location,
      isManual: true,
    },
    include: {
      employee: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
}

export async function updateManualAttendance(
  id: string,
  input: Partial<ManualAttendanceInput>
) {
  const existing = await prisma.attendance.findUnique({ where: { id } });
  if (!existing) {
    throw new AttendanceError("Attendance record not found");
  }

  const checkIn = input.checkIn ?? existing.checkIn ?? undefined;
  const checkOut = input.checkOut ?? existing.checkOut ?? undefined;
  const workHours =
    checkIn && checkOut ? calculateWorkHours(checkIn, checkOut) : existing.workHours;

  return prisma.attendance.update({
    where: { id },
    data: {
      ...(input.checkIn !== undefined && { checkIn: input.checkIn }),
      ...(input.checkOut !== undefined && { checkOut: input.checkOut }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.location !== undefined && { location: input.location }),
      workHours,
    },
    include: {
      employee: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
}

export async function getAttendanceRecords(
  filters: AttendanceFilterInput,
  scope: AttendanceScope
) {
  const scopedIds = await resolveScopedEmployeeIds(scope);
  const { page, limit, startDate, endDate, employeeId, status } = filters;
  const skip = (page - 1) * limit;

  if (employeeId && scopedIds && !scopedIds.includes(employeeId)) {
    throw new AttendanceError("You do not have access to this employee's attendance");
  }

  const where = {
    ...(scopedIds && { employeeId: { in: employeeId ? [employeeId] : scopedIds } }),
    ...(!scopedIds && employeeId && { employeeId }),
    ...(status && { status }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: toDateOnly(startDate) }),
            ...(endDate && { lte: toDateOnly(endDate) }),
          },
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        employee: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: [{ date: "desc" }, { checkIn: "desc" }],
      skip,
      take: limit,
    }),
    prisma.attendance.count({ where }),
  ]);

  return {
    records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAttendanceReport(
  filters: AttendanceFilterInput,
  scope: AttendanceScope
) {
  const scopedIds = await resolveScopedEmployeeIds(scope);
  const { startDate, endDate, employeeId, status } = filters;

  if (employeeId && scopedIds && !scopedIds.includes(employeeId)) {
    throw new AttendanceError("You do not have access to this employee's attendance");
  }

  const rangeStart = startDate ? toDateOnly(startDate) : startOfMonth(new Date());
  const rangeEnd = endDate ? toDateOnly(endDate) : endOfMonth(new Date());

  const where = {
    ...(scopedIds && { employeeId: { in: employeeId ? [employeeId] : scopedIds } }),
    ...(!scopedIds && employeeId && { employeeId }),
    ...(status && { status }),
    date: { gte: rangeStart, lte: rangeEnd },
  };

  const records = await prisma.attendance.findMany({
    where,
    include: {
      employee: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { date: "asc" },
  });

  const summary = records.reduce(
    (acc, record) => {
      acc.totalDays += 1;
      acc.byStatus[record.status] = (acc.byStatus[record.status] ?? 0) + 1;
      if (record.workHours) acc.totalWorkHours += record.workHours;
      return acc;
    },
    {
      totalDays: 0,
      totalWorkHours: 0,
      byStatus: {} as Record<AttendanceStatus, number>,
    }
  );

  return { records, summary, rangeStart, rangeEnd };
}

export async function getAttendanceCalendarStats(
  employeeId: string,
  month: number,
  year: number
) {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(monthStart);

  const records = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: { gte: monthStart, lte: monthEnd },
    },
    orderBy: { date: "asc" },
  });

  const stats = {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    remote: 0,
    onLeave: 0,
    totalWorkHours: 0,
    workingDays: records.length,
  };

  for (const record of records) {
    switch (record.status) {
      case "PRESENT":
        stats.present += 1;
        break;
      case "ABSENT":
        stats.absent += 1;
        break;
      case "LATE":
        stats.late += 1;
        break;
      case "HALF_DAY":
        stats.halfDay += 1;
        break;
      case "REMOTE":
        stats.remote += 1;
        break;
      case "ON_LEAVE":
        stats.onLeave += 1;
        break;
    }
    if (record.workHours) stats.totalWorkHours += record.workHours;
  }

  return { records, stats, monthStart, monthEnd };
}

export async function getAttendanceEmployeesForSelect(scope: AttendanceScope) {
  const scopedIds = await resolveScopedEmployeeIds(scope);

  if (scopedIds) {
    return prisma.employee.findMany({
      where: { id: { in: scopedIds }, status: "ACTIVE" },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    });
  }

  return prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });
}

export async function getRecentAttendanceTrend(employeeId: string, days = 30) {
  const end = endOfDay(new Date());
  const start = startOfDay(subMonths(end, 1));

  return prisma.attendance.findMany({
    where: {
      employeeId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  });
}

import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { startOfMonth, endOfMonth, startOfDay, subDays } from "date-fns";

export async function getDashboardStats(userId: string, role: Role, employeeId?: string) {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const baseQueries = {
    totalEmployees: prisma.employee.count({ where: { status: "ACTIVE" } }),
    totalDepartments: prisma.department.count({ where: { isActive: true } }),
    pendingLeaves: prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    todayPresent: prisma.attendance.count({
      where: { date: today, status: { in: ["PRESENT", "LATE", "REMOTE"] } },
    }),
    todayAbsent: prisma.attendance.count({
      where: { date: today, status: "ABSENT" },
    }),
    recentAnnouncements: prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    monthlyPayroll: prisma.payrollRun.findFirst({
      where: {
        periodStart: { gte: monthStart },
        periodEnd: { lte: monthEnd },
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    }),
  };

  if (role === "EMPLOYEE" && employeeId) {
    const [myAttendance, myLeaves, myLeaveBalance, myPayslips] = await Promise.all([
      prisma.attendance.findMany({
        where: { employeeId, date: { gte: subDays(today, 7) } },
        orderBy: { date: "desc" },
      }),
      prisma.leaveRequest.findMany({
        where: { employeeId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.leaveBalance.findMany({
        where: { employeeId, year: today.getFullYear() },
      }),
      prisma.payslip.findMany({
        where: { employeeId },
        include: { payrollRun: true },
        orderBy: { generatedAt: "desc" },
        take: 3,
      }),
    ]);

    const recentAnnouncements = await baseQueries.recentAnnouncements;

    return {
      role,
      employee: { myAttendance, myLeaves, myLeaveBalance, myPayslips },
      recentAnnouncements,
    };
  }

  if (role === "MANAGER" && employeeId) {
    const teamMembers = await prisma.employee.findMany({
      where: { managerId: employeeId, status: "ACTIVE" },
      select: { id: true },
    });
    const teamIds = teamMembers.map((m) => m.id);

    const [teamPendingLeaves, teamAttendance] = await Promise.all([
      prisma.leaveRequest.count({
        where: { employeeId: { in: teamIds }, status: "PENDING" },
      }),
      prisma.attendance.findMany({
        where: { employeeId: { in: teamIds }, date: today },
        include: { employee: { include: { user: { select: { name: true } } } } },
      }),
    ]);

    const [totalEmployees, pendingLeaves, todayPresent, recentAnnouncements] =
      await Promise.all([
        baseQueries.totalEmployees,
        teamPendingLeaves,
        baseQueries.todayPresent,
        baseQueries.recentAnnouncements,
      ]);

    return {
      role,
      stats: { totalEmployees, totalDepartments: 0, pendingLeaves, todayPresent, todayAbsent: 0 },
      team: { teamAttendance, teamSize: teamIds.length },
      recentAnnouncements,
    };
  }

  const [totalEmployees, totalDepartments, pendingLeaves, todayPresent, todayAbsent, recentAnnouncements, monthlyPayroll] =
    await Promise.all([
      baseQueries.totalEmployees,
      baseQueries.totalDepartments,
      baseQueries.pendingLeaves,
      baseQueries.todayPresent,
      baseQueries.todayAbsent,
      baseQueries.recentAnnouncements,
      baseQueries.monthlyPayroll,
    ]);

  return {
    role,
    stats: { totalEmployees, totalDepartments, pendingLeaves, todayPresent, todayAbsent },
    recentAnnouncements,
    monthlyPayroll,
  };
}

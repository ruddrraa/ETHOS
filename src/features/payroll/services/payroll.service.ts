import { prisma } from "@/lib/prisma";
import type { PayrollStatus, SalaryStructure } from "@prisma/client";
import {
  eachDayOfInterval,
  isWeekend,
  startOfDay,
  endOfDay,
} from "date-fns";

export interface SalaryBreakdown {
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export function calculateSalaryFromStructure(structure: SalaryStructure): SalaryBreakdown {
  const allowances =
    structure.housingAllowance +
    structure.transportAllowance +
    structure.medicalAllowance +
    structure.otherAllowances;

  const deductions = structure.taxDeduction + structure.otherDeductions;
  const netSalary = structure.baseSalary + allowances - deductions;

  return {
    baseSalary: structure.baseSalary,
    allowances,
    deductions,
    netSalary: Math.round(netSalary * 100) / 100,
  };
}

function countWorkingDays(periodStart: Date, periodEnd: Date): number {
  const days = eachDayOfInterval({ start: periodStart, end: periodEnd });
  return days.filter((day) => !isWeekend(day)).length;
}

async function getAttendanceSummary(
  employeeId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: {
        gte: startOfDay(periodStart),
        lte: endOfDay(periodEnd),
      },
    },
  });

  const presentDays = attendances.filter((a) =>
    ["PRESENT", "LATE", "REMOTE", "HALF_DAY"].includes(a.status)
  ).length;

  const leaveDays = attendances.filter((a) => a.status === "ON_LEAVE").length;

  return { presentDays, leaveDays };
}

export async function getPayrollRuns(options?: { status?: PayrollStatus }) {
  return prisma.payrollRun.findMany({
    where: options?.status ? { status: options.status } : undefined,
    include: {
      _count: { select: { payslips: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPayrollRunById(id: string) {
  return prisma.payrollRun.findUnique({
    where: { id },
    include: {
      payslips: {
        include: {
          employee: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { generatedAt: "desc" },
      },
    },
  });
}

export async function getPayslipById(id: string) {
  return prisma.payslip.findUnique({
    where: { id },
    include: {
      payrollRun: true,
      employee: {
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true } },
          company: { select: { name: true } },
        },
      },
    },
  });
}

export async function getEmployeePayslips(employeeId: string) {
  return prisma.payslip.findMany({
    where: { employeeId },
    include: {
      payrollRun: { select: { title: true, periodStart: true, periodEnd: true, status: true } },
    },
    orderBy: { generatedAt: "desc" },
  });
}

export async function getSalaryStructure(employeeId: string) {
  return prisma.salaryStructure.findUnique({
    where: { employeeId },
    include: {
      employee: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
}

export async function getActiveEmployeesWithSalary() {
  return prisma.employee.findMany({
    where: { status: "ACTIVE", salaryStructure: { isNot: null } },
    include: {
      salaryStructure: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function createPayrollRun(data: {
  title: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  return prisma.payrollRun.create({
    data: {
      title: data.title,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      status: "DRAFT",
    },
  });
}

export async function upsertSalaryStructure(data: {
  employeeId: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  taxDeduction: number;
  otherDeductions: number;
  effectiveFrom: Date;
}) {
  return prisma.salaryStructure.upsert({
    where: { employeeId: data.employeeId },
    create: data,
    update: {
      baseSalary: data.baseSalary,
      housingAllowance: data.housingAllowance,
      transportAllowance: data.transportAllowance,
      medicalAllowance: data.medicalAllowance,
      otherAllowances: data.otherAllowances,
      taxDeduction: data.taxDeduction,
      otherDeductions: data.otherDeductions,
      effectiveFrom: data.effectiveFrom,
    },
  });
}

export async function processPayrollRun(payrollRunId: string) {
  const payrollRun = await prisma.payrollRun.findUnique({
    where: { id: payrollRunId },
  });

  if (!payrollRun) {
    throw new Error("Payroll run not found");
  }

  if (payrollRun.status === "COMPLETED") {
    throw new Error("Payroll run has already been processed");
  }

  if (payrollRun.status === "PROCESSING") {
    throw new Error("Payroll run is already being processed");
  }

  await prisma.payrollRun.update({
    where: { id: payrollRunId },
    data: { status: "PROCESSING" },
  });

  try {
    const employees = await getActiveEmployeesWithSalary();
    const workingDays = countWorkingDays(payrollRun.periodStart, payrollRun.periodEnd);

    let totalAmount = 0;
    const payslipData: Array<{
      payrollRunId: string;
      employeeId: string;
      baseSalary: number;
      allowances: number;
      deductions: number;
      netSalary: number;
      workingDays: number;
      presentDays: number;
      leaveDays: number;
    }> = [];

    for (const employee of employees) {
      const structure = employee.salaryStructure!;
      const breakdown = calculateSalaryFromStructure(structure);
      const { presentDays, leaveDays } = await getAttendanceSummary(
        employee.id,
        payrollRun.periodStart,
        payrollRun.periodEnd
      );

      payslipData.push({
        payrollRunId,
        employeeId: employee.id,
        baseSalary: breakdown.baseSalary,
        allowances: breakdown.allowances,
        deductions: breakdown.deductions,
        netSalary: breakdown.netSalary,
        workingDays,
        presentDays,
        leaveDays,
      });

      totalAmount += breakdown.netSalary;
    }

    await prisma.$transaction([
      prisma.payslip.deleteMany({ where: { payrollRunId } }),
      prisma.payslip.createMany({ data: payslipData }),
      prisma.payrollRun.update({
        where: { id: payrollRunId },
        data: {
          status: "COMPLETED",
          totalAmount: Math.round(totalAmount * 100) / 100,
          employeeCount: payslipData.length,
          processedAt: new Date(),
        },
      }),
    ]);

    return prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        payslips: {
          include: {
            employee: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
      },
    });
  } catch (error) {
    await prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

export async function getPayrollChartData() {
  const runs = await prisma.payrollRun.findMany({
    where: { status: "COMPLETED" },
    orderBy: { periodStart: "asc" },
    take: 12,
    select: {
      id: true,
      title: true,
      periodStart: true,
      totalAmount: true,
      employeeCount: true,
    },
  });

  return runs.map((run) => ({
    name: run.title,
    period: run.periodStart.toISOString().slice(0, 7),
    totalAmount: run.totalAmount,
    employeeCount: run.employeeCount,
  }));
}

export async function deletePayrollRun(id: string) {
  const run = await prisma.payrollRun.findUnique({ where: { id } });
  if (!run) throw new Error("Payroll run not found");
  if (run.status === "PROCESSING") {
    throw new Error("Cannot delete a payroll run that is being processed");
  }

  return prisma.payrollRun.delete({ where: { id } });
}

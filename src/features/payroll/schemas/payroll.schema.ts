import { z } from "zod";

export const createPayrollRunSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "Period end must be on or after period start",
    path: ["periodEnd"],
  });

export type CreatePayrollRunInput = z.infer<typeof createPayrollRunSchema>;

export const processPayrollRunSchema = z.object({
  payrollRunId: z.string().min(1, "Payroll run ID is required"),
});

export type ProcessPayrollRunInput = z.infer<typeof processPayrollRunSchema>;

export const salaryStructureSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  baseSalary: z.coerce.number().min(0, "Base salary must be positive"),
  housingAllowance: z.coerce.number().min(0).default(0),
  transportAllowance: z.coerce.number().min(0).default(0),
  medicalAllowance: z.coerce.number().min(0).default(0),
  otherAllowances: z.coerce.number().min(0).default(0),
  taxDeduction: z.coerce.number().min(0).default(0),
  otherDeductions: z.coerce.number().min(0).default(0),
  effectiveFrom: z.coerce.date(),
});

export type SalaryStructureInput = z.infer<typeof salaryStructureSchema>;

export const payrollRunIdSchema = z.object({
  id: z.string().min(1),
});

export const payslipIdSchema = z.object({
  id: z.string().min(1),
});

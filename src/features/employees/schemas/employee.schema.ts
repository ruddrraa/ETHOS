import { EmployeeStatus, Role } from "@prisma/client";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const employmentTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"] as const;

export const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
  role: z.nativeEnum(Role).default(Role.EMPLOYEE),
  jobTitle: z.string().min(2, "Job title is required"),
  departmentId: z.string().cuid().optional().nullable(),
  managerId: z.string().cuid().optional().nullable(),
  employmentType: z.enum(employmentTypes).default("FULL_TIME"),
  status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
  dateOfJoining: z.coerce.date({ message: "Date of joining is required" }),
  dateOfBirth: z.coerce.date().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  emergencyContact: z.string().max(100).optional().nullable(),
  emergencyPhone: z.string().max(20).optional().nullable(),
  baseSalary: z.coerce.number().min(0, "Base salary must be positive").optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  role: z.nativeEnum(Role).optional(),
  jobTitle: z.string().min(2, "Job title is required").optional(),
  departmentId: z.string().cuid().optional().nullable(),
  managerId: z.string().cuid().optional().nullable(),
  employmentType: z.enum(employmentTypes).optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  dateOfJoining: z.coerce.date().optional(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  emergencyContact: z.string().max(100).optional().nullable(),
  emergencyPhone: z.string().max(20).optional().nullable(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const employeeFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
});

export type EmployeeFilterInput = z.infer<typeof employeeFilterSchema>;

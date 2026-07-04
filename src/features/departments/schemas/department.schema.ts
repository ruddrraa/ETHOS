import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name is too long"),
  description: z.string().max(500).optional().nullable(),
  managerId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name is too long")
    .optional(),
  description: z.string().max(500).optional().nullable(),
  managerId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const departmentFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

export type DepartmentFilterInput = z.infer<typeof departmentFilterSchema>;

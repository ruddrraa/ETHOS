import { LeaveType } from "@prisma/client";
import { z } from "zod";

export const applyLeaveSchema = z
  .object({
    leaveType: z.nativeEnum(LeaveType),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters")
      .max(500, "Reason must not exceed 500 characters"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const approveLeaveSchema = z.object({
  leaveRequestId: z.string().min(1, "Leave request is required"),
});

export const rejectLeaveSchema = z.object({
  leaveRequestId: z.string().min(1, "Leave request is required"),
  rejectionReason: z
    .string()
    .min(5, "Rejection reason must be at least 5 characters")
    .max(500, "Rejection reason must not exceed 500 characters"),
});

export const cancelLeaveSchema = z.object({
  leaveRequestId: z.string().min(1, "Leave request is required"),
});

export const leaveFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  employeeId: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  leaveType: z.nativeEnum(LeaveType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;
export type RejectLeaveInput = z.infer<typeof rejectLeaveSchema>;
export type CancelLeaveInput = z.infer<typeof cancelLeaveSchema>;
export type LeaveFilterInput = z.infer<typeof leaveFilterSchema>;

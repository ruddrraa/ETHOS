import { AttendanceStatus } from "@prisma/client";
import { z } from "zod";

export const checkInSchema = z.object({
  location: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export const checkOutSchema = z.object({
  notes: z.string().max(500).optional(),
});

export const manualAttendanceSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    date: z.coerce.date(),
    checkIn: z.coerce.date().optional(),
    checkOut: z.coerce.date().optional(),
    status: z.nativeEnum(AttendanceStatus),
    notes: z.string().max(500).optional(),
    location: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      if (data.checkIn && data.checkOut) {
        return data.checkOut > data.checkIn;
      }
      return true;
    },
    { message: "Check-out must be after check-in", path: ["checkOut"] }
  );

export const attendanceFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  employeeId: z.string().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;
export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;

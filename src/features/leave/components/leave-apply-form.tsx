"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyLeaveSchema, type ApplyLeaveInput } from "@/features/leave/schemas/leave.schema";
import { applyLeaveAction } from "@/features/leave/actions/leave.actions";
import { LeaveType } from "@prisma/client";

export function LeaveApplyForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyLeaveInput>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leaveType: LeaveType.PAID,
    }
  });

  async function onSubmit(data: ApplyLeaveInput) {
    setIsLoading(true);
    try {
      const result = await applyLeaveAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Leave request submitted successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="leaveType">Leave Type</Label>
        <select 
          id="leaveType" 
          {...register("leaveType")} 
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {Object.values(LeaveType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.leaveType && <p className="text-sm text-destructive">{errors.leaveType.message}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason / Remarks</Label>
        <Input id="reason" {...register("reason")} placeholder="Please specify the reason..." />
        {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Submit Leave Request
      </Button>
    </form>
  );
}

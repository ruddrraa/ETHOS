"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPayrollRunSchema, type CreatePayrollRunInput } from "@/features/payroll/schemas/payroll.schema";
import { createPayrollRunAction, processPayrollRunAction } from "@/features/payroll/actions/payroll.actions";

export function CreatePayrollForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePayrollRunInput>({
    resolver: zodResolver(createPayrollRunSchema),
  });

  async function onSubmit(data: CreatePayrollRunInput) {
    setIsLoading(true);
    try {
      // 1. Create the run
      const createRes = await createPayrollRunAction(data);
      if (!createRes.success) {
        toast.error(createRes.error);
        return;
      }
      
      // 2. Process the run (generates payslips based on salary structures & attendance)
      const processRes = await processPayrollRunAction({ payrollRunId: createRes.data.id });
      if (!processRes.success) {
        toast.error(processRes.error);
        return;
      }

      toast.success(`Payroll processed for ${processRes.data.employeeCount} employees`);
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
        <Label htmlFor="title">Payroll Title (e.g. November 2026 Salary)</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="periodStart">Period Start</Label>
          <Input id="periodStart" type="date" {...register("periodStart")} />
          {errors.periodStart && <p className="text-sm text-destructive">{errors.periodStart.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="periodEnd">Period End</Label>
          <Input id="periodEnd" type="date" {...register("periodEnd")} />
          {errors.periodEnd && <p className="text-sm text-destructive">{errors.periodEnd.message}</p>}
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Generate Payroll & Payslips
      </Button>
    </form>
  );
}

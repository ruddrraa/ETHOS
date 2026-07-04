"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { salaryStructureSchema, type SalaryStructureInput } from "@/features/payroll/schemas/payroll.schema";
import { upsertSalaryStructureAction } from "@/features/payroll/actions/payroll.actions";

interface SalaryStructureFormProps {
  employeeId: string;
  defaultValues?: Partial<SalaryStructureInput>;
  onSuccess?: () => void;
}

export function SalaryStructureForm({ employeeId, defaultValues, onSuccess }: SalaryStructureFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SalaryStructureInput>({
    resolver: zodResolver(salaryStructureSchema),
    defaultValues: {
      employeeId,
      baseSalary: defaultValues?.baseSalary || 0,
      housingAllowance: defaultValues?.housingAllowance || 0,
      transportAllowance: defaultValues?.transportAllowance || 0,
      medicalAllowance: defaultValues?.medicalAllowance || 0,
      otherAllowances: defaultValues?.otherAllowances || 0,
      taxDeduction: defaultValues?.taxDeduction || 0,
      otherDeductions: defaultValues?.otherDeductions || 0,
      effectiveFrom: defaultValues?.effectiveFrom ? new Date(defaultValues.effectiveFrom) : new Date(),
    }
  });

  async function onSubmit(data: SalaryStructureInput) {
    setIsLoading(true);
    try {
      const result = await upsertSalaryStructureAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Salary structure updated successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="baseSalary">Base Salary</Label>
          <Input id="baseSalary" type="number" {...register("baseSalary")} />
          {errors.baseSalary && <p className="text-sm text-destructive">{errors.baseSalary.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="housingAllowance">Housing Allowance</Label>
          <Input id="housingAllowance" type="number" {...register("housingAllowance")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transportAllowance">Transport Allowance</Label>
          <Input id="transportAllowance" type="number" {...register("transportAllowance")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalAllowance">Medical Allowance</Label>
          <Input id="medicalAllowance" type="number" {...register("medicalAllowance")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherAllowances">Other Allowances</Label>
          <Input id="otherAllowances" type="number" {...register("otherAllowances")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxDeduction">Tax Deduction</Label>
          <Input id="taxDeduction" type="number" {...register("taxDeduction")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherDeductions">Other Deductions</Label>
          <Input id="otherDeductions" type="number" {...register("otherDeductions")} />
        </div>
        
        <div className="space-y-2 col-span-2">
          <Label htmlFor="effectiveFrom">Effective From</Label>
          <Input id="effectiveFrom" type="date" {...register("effectiveFrom")} />
          {errors.effectiveFrom && <p className="text-sm text-destructive">{errors.effectiveFrom.message}</p>}
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Save Salary Structure
      </Button>
    </form>
  );
}

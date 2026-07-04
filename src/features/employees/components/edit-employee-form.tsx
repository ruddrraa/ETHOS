"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateEmployeeSchema, type UpdateEmployeeInput } from "@/features/employees/schemas/employee.schema";
import { updateEmployeeAction } from "@/features/employees/actions/employee.actions";

interface EditEmployeeFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  employee: any;
  departments?: { id: string; name: string }[];
  isAdmin: boolean;
  onSuccess?: () => void;
}

export function EditEmployeeForm({ employee, departments = [], isAdmin, onSuccess }: EditEmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      phone: employee.phone || "",
      address: employee.address || "",
      city: employee.city || "",
      country: employee.country || "",
      emergencyContact: employee.emergencyContact || "",
      emergencyPhone: employee.emergencyPhone || "",
      jobTitle: employee.jobTitle,
      // other fields as needed
    }
  });

  async function onSubmit(data: UpdateEmployeeInput) {
    setIsLoading(true);
    try {
      // Use real action
      const result = await updateEmployeeAction(employee.id, data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated successfully");
      setIsLoading(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        {isAdmin && (
          <>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" {...register("jobTitle")} />
            </div>
            
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="departmentId">Department</Label>
              <Select 
                defaultValue={employee.departmentId || "unassigned"} 
                onValueChange={(val) => register("departmentId").onChange({ target: { value: val === "unassigned" ? "" : val, name: "departmentId" } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="status">Status</Label>
              <Select 
                defaultValue={employee.status || "ACTIVE"} 
                onValueChange={(val) => register("status").onChange({ target: { value: val, name: "status" } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select 
                defaultValue={employee.employmentType || "FULL_TIME"} 
                onValueChange={(val) => register("employmentType").onChange({ target: { value: val, name: "employmentType" } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="INTERN">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
          <Input id="emergencyContact" {...register("emergencyContact")} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
          <Input id="emergencyPhone" {...register("emergencyPhone")} />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} />
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Save Changes
      </Button>
    </form>
  );
}

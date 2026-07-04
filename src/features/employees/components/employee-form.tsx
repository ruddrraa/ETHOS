"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createEmployeeSchema, type CreateEmployeeInput, employmentTypes } from "@/features/employees/schemas/employee.schema";
import { createEmployeeAction } from "@/features/employees/actions/employee.actions";
import { Role } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EmployeeForm({ departments = [] }: { departments?: { id: string, name: string }[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      role: Role.EMPLOYEE,
      employmentType: "FULL_TIME",
    }
  });

  async function onSubmit(data: CreateEmployeeInput) {
    setIsLoading(true);
    try {
      const result = await createEmployeeAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Employee created successfully");
      router.push("/employees");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Add Employee</CardTitle>
        <CardDescription>Register a new employee in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="john@company.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                defaultValue={Role.EMPLOYEE} 
                onValueChange={(val) => register("role").onChange({ target: { value: val, name: "role" } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map(role => (
                    <SelectItem key={role} value={role}>{role.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" {...register("jobTitle")} placeholder="Software Engineer" />
              {errors.jobTitle && <p className="text-sm text-destructive">{errors.jobTitle.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select 
                defaultValue="FULL_TIME"
                onValueChange={(val) => register("employmentType").onChange({ target: { value: val, name: "employmentType" } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employmentType && <p className="text-sm text-destructive">{errors.employmentType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">Department (Optional)</Label>
              <Select 
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

            <div className="space-y-2">
              <Label htmlFor="baseSalary">Initial Base Salary</Label>
              <Input id="baseSalary" type="number" {...register("baseSalary")} placeholder="0.00" />
              {errors.baseSalary && <p className="text-sm text-destructive">{errors.baseSalary.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfJoining">Date of Joining</Label>
              <Input id="dateOfJoining" type="date" {...register("dateOfJoining")} />
              {errors.dateOfJoining && <p className="text-sm text-destructive">{errors.dateOfJoining.message}</p>}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Register Employee</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

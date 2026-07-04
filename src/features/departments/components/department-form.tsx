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
import { createDepartmentSchema, type CreateDepartmentInput } from "@/features/departments/schemas/department.schema";
import { createDepartmentAction } from "@/features/departments/actions/department.actions";

export function DepartmentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      isActive: true,
    }
  });

  async function onSubmit(data: CreateDepartmentInput) {
    setIsLoading(true);
    try {
      const result = await createDepartmentAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Department created successfully");
      router.push("/departments");
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
        <CardTitle>Create Department</CardTitle>
        <CardDescription>Add a new department to the organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. Engineering" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} placeholder="Department description" />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Create Department</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

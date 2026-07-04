"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDepartmentAction } from "@/features/departments/actions/department.actions";
import { updateDepartmentSchema, type UpdateDepartmentInput } from "@/features/departments/schemas/department.schema";

interface EditDepartmentModalProps {
  department: {
    id: string;
    name: string;
    description: string | null;
    managerId: string | null;
  };
  employees: { id: string; user: { name: string | null } }[];
}

export function EditDepartmentModal({ department, employees }: EditDepartmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateDepartmentInput>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: {
      name: department.name,
      description: department.description || "",
      managerId: department.managerId,
    },
  });

  const selectedManager = watch("managerId");

  async function onSubmit(data: UpdateDepartmentInput) {
    setIsLoading(true);
    try {
      const result = await updateDepartmentAction(department.id, data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Department updated successfully");
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" /> Edit Department
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update department details and reassign the manager.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="e.g. Handles product engineering"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerId">Department Manager</Label>
            <Select 
              value={selectedManager || "unassigned"} 
              onValueChange={(val) => setValue("managerId", val === "unassigned" ? null : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.user.name || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.managerId && (
              <p className="text-sm text-destructive">{errors.managerId.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

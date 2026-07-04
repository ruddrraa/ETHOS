"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateEmployeeAction } from "@/features/employees/actions/employee.actions";

interface AssignEmployeesModalProps {
  departmentId: string;
  availableEmployees: { id: string; name: string | null; jobTitle: string }[];
}

export function AssignEmployeesModal({ departmentId, availableEmployees }: AssignEmployeesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAssign(employeeId: string) {
    setIsLoading(true);
    try {
      const result = await updateEmployeeAction(employeeId, { departmentId });
      if (!result.success) {
        toast.error(result.error || "Failed to assign employee");
        return;
      }
      toast.success("Employee assigned to department");
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Employees</DialogTitle>
          <DialogDescription>
            Select employees to move into this department.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {availableEmployees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No available employees found.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {availableEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{emp.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleAssign(emp.id)}
                    disabled={isLoading}
                  >
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

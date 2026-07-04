import { requireAuth } from "@/lib/auth/guards";
import { getEmployees } from "@/features/employees/services/employee.service";
import { EmployeeList } from "@/features/employees/components/employee-list";
import type { Role } from "@prisma/client";

export const metadata = { title: "Employees" };

export default async function EmployeesPage() {
  const user = await requireAuth();
  const employees = await getEmployees(user.role as Role, user.employeeId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view employee information across the organization.
        </p>
      </div>
      
      <EmployeeList data={employees} userRole={user.role} />
    </div>
  );
}

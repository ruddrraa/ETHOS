import { requirePermission } from "@/lib/auth/guards";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "New Employee" };

export default async function NewEmployeePage() {
  const user = await requirePermission("employees:create");

  const company = await prisma.company.findFirst();
  const departments = company ? await prisma.department.findMany({
    where: { companyId: company.id },
    select: { id: true, name: true },
  }) : [];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Employee</h1>
        <p className="text-muted-foreground mt-1">
          Register a new employee and create their account.
        </p>
      </div>
      
      <EmployeeForm departments={departments} />
    </div>
  );
}

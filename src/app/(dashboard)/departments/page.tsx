import { requireAuth } from "@/lib/auth/guards";
import { getDepartments } from "@/features/departments/services/department.service";
import { DepartmentList } from "@/features/departments/components/department-list";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const user = await requireAuth();
  
  // Get user's company ID
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { companyId: true }
  });
  
  const companyId = employee?.companyId || "default-company"; // Fallback to seed default
  const departments = await getDepartments(companyId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <p className="text-muted-foreground mt-1">
          Manage organizational structure and departments.
        </p>
      </div>
      
      <DepartmentList data={departments} userRole={user.role} />
    </div>
  );
}

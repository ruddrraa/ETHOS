import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { hasPermission } from "@/lib/rbac/permissions";
import type { Role } from "@prisma/client";
import { AssignEmployeesModal } from "@/features/departments/components/assign-employees-modal";
import { EditDepartmentModal } from "@/features/departments/components/edit-department-modal";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const department = await prisma.department.findUnique({
    where: { id: params.id },
  });
  return { title: department?.name || "Department Details" };
}

export default async function DepartmentDetailsPage({ params }: { params: { id: string } }) {
  const user = await requirePermission("departments:view");
  
  const department = await prisma.department.findUnique({
    where: { id: params.id },
    include: {
      manager: { include: { user: true } },
      employees: {
        include: { user: true },
        where: { status: "ACTIVE" }
      }
    }
  });

  const availableEmployees = await prisma.employee.findMany({
    where: {
      status: "ACTIVE",
      companyId: department?.companyId,
      departmentId: { not: params.id }
    },
    include: { user: true }
  });

  if (!department) {
    notFound();
  }

  const canEdit = hasPermission(user.role as Role, "departments:update");

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/departments">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Department Details</h1>
        </div>
        {canEdit && (
          <EditDepartmentModal 
            department={department} 
            employees={department.employees} 
          />
        )}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{department.name}</CardTitle>
            <Badge variant={department.isActive ? "success" : "secondary"}>
              {department.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-4">
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-base mt-1">{department.description || "No description provided."}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Manager</p>
              <p className="text-base mt-1">{department.manager?.user.name || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Headcount</p>
              <p className="text-base mt-1">{department.employees.length} active employees</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Team Members</CardTitle>
          {canEdit && (
            <AssignEmployeesModal 
              departmentId={params.id} 
              availableEmployees={availableEmployees.map(emp => ({
                id: emp.id,
                name: emp.user.name,
                jobTitle: emp.jobTitle
              }))} 
            />
          )}
        </CardHeader>
        <CardContent>
          {department.employees.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No employees in this department.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {department.employees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{emp.user.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                  </div>
                  <Link href={`/employees/${emp.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

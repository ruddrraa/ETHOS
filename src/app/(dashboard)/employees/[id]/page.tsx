import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Wallet, User, Calendar, History, FolderOpen } from "lucide-react";
import { hasPermission } from "@/lib/rbac/permissions";
import type { Role } from "@prisma/client";
import { SalaryStructureForm } from "@/features/payroll/components/salary-structure-form";
import { EditEmployeeForm } from "@/features/employees/components/edit-employee-form";
import { DeleteEmployeeButton } from "@/features/employees/components/delete-employee-button";
import { EmployeeTimeline } from "@/features/employees/components/employee-timeline";
import { EmployeeAttendanceVisuals } from "@/features/employees/components/employee-attendance-visuals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  return { title: employee?.user.name || "Employee Profile" };
}

export default async function EmployeeDetailsPage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
  
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      department: true,
      manager: { include: { user: true } },
      salaryStructure: true,
    }
  });

  const departments = await prisma.department.findMany({
    where: { companyId: employee?.companyId },
    select: { id: true, name: true },
  });

  if (!employee) {
    notFound();
  }

  // Visibility checks
  if (user.role === "EMPLOYEE" && user.employeeId !== employee.id) {
    return (
      <div className="py-12 text-center text-muted-foreground animate-fade-in">
        You do not have permission to view this profile.
      </div>
    );
  }
  if (user.role === "MANAGER" && user.employeeId !== employee.id && employee.managerId !== user.employeeId) {
    return (
      <div className="py-12 text-center text-muted-foreground animate-fade-in">
        You do not have permission to view this profile.
      </div>
    );
  }

  const canEdit = hasPermission(user.role as Role, "employees:update");

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/employees">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Employee Workspace</h1>
        </div>
        <div className="flex items-center gap-2">
          {["SUPER_ADMIN", "HR"].includes(user.role) && (
            <DeleteEmployeeButton employeeId={employee.id} employeeName={employee.user.name || "Employee"} />
          )}
          <Button variant="default" className="rounded-xl">Contact</Button>
        </div>
      </div>
      
      <Card className="overflow-hidden border-border/60 shadow-sm relative">
        <div className="h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.2)_0%,transparent_50%)] bg-muted w-full"></div>
        <CardHeader className="pb-4 relative pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
            <Avatar className="h-28 w-28 border-4 border-background shadow-md bg-white">
              <AvatarImage src={employee.user.image ?? undefined} className="object-cover" />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">{getInitials(employee.user.name ?? employee.user.email)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl font-bold">{employee.user.name}</CardTitle>
                <Badge variant={employee.status === "ACTIVE" ? "success" : "secondary"} className="shadow-sm">
                  {employee.status}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground font-medium mt-1">{employee.jobTitle}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="bg-background">{employee.user.role.replace("_", " ")}</Badge>
                <Badge variant="outline" className="bg-background">{employee.employmentType.replace("_", " ")}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-2"><User className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2"><Calendar className="h-4 w-4" /> Attendance</TabsTrigger>
          {hasPermission(user.role as Role, "payroll:manage") && (
            <TabsTrigger value="payroll" className="gap-2"><Wallet className="h-4 w-4" /> Payroll & Assets</TabsTrigger>
          )}
          <TabsTrigger value="documents" className="gap-2"><FolderOpen className="h-4 w-4" /> Documents</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2"><History className="h-4 w-4" /> Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-8">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Employee ID</p>
                  <p className="text-base mt-1">{employee.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-base mt-2 font-medium">{employee.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Department</p>
                  <p className="text-base mt-2 font-medium">{employee.department?.name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Manager</p>
                  <p className="text-base mt-2 font-medium">{employee.manager?.user.name || "None"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date of Joining</p>
                  <p className="text-base mt-2 font-medium">{formatDate(employee.dateOfJoining)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-base mt-2 font-medium">{employee.phone || "N/A"}</p>
                </div>
                {["SUPER_ADMIN", "HR"].includes(user.role) && (
                  <>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                      <p className="text-base mt-2 font-medium">
                        {[employee.address, employee.city, employee.country].filter(Boolean).join(", ") || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Emergency Contact</p>
                      <p className="text-base mt-2 font-medium">{employee.emergencyContact || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Emergency Phone</p>
                      <p className="text-base mt-2 font-medium">{employee.emergencyPhone || "N/A"}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {canEdit && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xl">
                  <EditEmployeeForm 
                    employee={employee} 
                    departments={departments}
                    isAdmin={["SUPER_ADMIN", "HR"].includes(user.role)} 
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attendance">
          <EmployeeAttendanceVisuals employeeId={employee.id} />
        </TabsContent>

        {hasPermission(user.role as Role, "payroll:manage") && (
          <TabsContent value="payroll">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Salary Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xl">
                  <SalaryStructureForm 
                    employeeId={employee.id} 
                    defaultValues={employee.salaryStructure || undefined} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="documents">
          <Card className="border-border/60 shadow-sm py-12">
            <CardContent className="text-center text-muted-foreground">
              <FolderOpen className="h-10 w-10 mx-auto opacity-20 mb-4" />
              <p>Employee documents repository.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <EmployeeTimeline employeeId={employee.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

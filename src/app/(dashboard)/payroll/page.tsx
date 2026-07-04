import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CreatePayrollForm } from "@/features/payroll/components/create-payroll-form";

export const metadata = { title: "Payroll" };

export default async function PayrollPage() {
  const user = await requireAuth();
  
  let payrollData = [];

  if (user.role === "EMPLOYEE") {
    payrollData = await prisma.payslip.findMany({
      where: { employeeId: user.employeeId },
      include: { payrollRun: true },
      orderBy: { generatedAt: "desc" },
      take: 12,
    });
  } else {
    payrollData = await prisma.payrollRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground mt-1">
          {user.role === "EMPLOYEE" ? "View your payslips and salary details." : "Manage company payroll runs and employee salaries."}
        </p>
      </div>

      {["SUPER_ADMIN", "HR"].includes(user.role) && (
        <Card className="mb-6 border-dashed bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Run Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePayrollForm />
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{user.role === "EMPLOYEE" ? "Recent Payslips" : "Recent Payroll Runs"}</CardTitle>
        </CardHeader>
        <CardContent>
          {payrollData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No payroll records found.</p>
          ) : (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {payrollData.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm">
                        {user.role === "EMPLOYEE" ? record.payrollRun.title : record.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.role === "EMPLOYEE" 
                          ? `Net Salary: ${formatCurrency(record.netSalary)}`
                          : `${record.employeeCount} employees · Total: ${formatCurrency(record.totalAmount)}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">
                    {user.role === "EMPLOYEE" ? "Generated" : record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

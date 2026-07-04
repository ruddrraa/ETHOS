import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { LeaveApplyForm } from "@/features/leave/components/leave-apply-form";
import { LeaveActionButtons } from "@/features/leave/components/leave-action-buttons";

export const metadata = { title: "Leaves" };

export default async function LeavePage() {
  const user = await requireAuth();
  
  let leaves = [];

  if (user.role === "EMPLOYEE") {
    leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: user.employeeId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } else if (user.role === "MANAGER" && user.employeeId) {
    const team = await prisma.employee.findMany({
      where: { managerId: user.employeeId },
      select: { id: true }
    });
    
    leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: { in: [user.employeeId, ...team.map(t => t.id)] } },
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } else {
    leaves = await prisma.leaveRequest.findMany({
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaves</h1>
        <p className="text-muted-foreground mt-1">
          Manage leave requests and balances.
        </p>
      </div>
      
      {user.role === "EMPLOYEE" && (
        <Card className="mb-6 border-dashed bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Apply for Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveApplyForm />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {leaves.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No leave requests found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type / Employee</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {leaves.map((leave: any) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <p className="font-semibold">{leave.leaveType}</p>
                      {leave.employee && <p className="text-xs text-muted-foreground mt-0.5">{leave.employee.user.name}</p>}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{leave.totalDays} day(s)</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={leave.status === "APPROVED" ? "success" : leave.status === "REJECTED" ? "destructive" : leave.status === "PENDING" ? "warning" : "secondary"}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {leave.status === "PENDING" && user.role !== "EMPLOYEE" ? (
                        <div className="flex justify-end">
                          <LeaveActionButtons leaveId={leave.id} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

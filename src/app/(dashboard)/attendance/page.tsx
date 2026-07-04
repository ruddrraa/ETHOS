import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
// import type { Role } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { AttendanceWidget } from "@/features/attendance/components/attendance-widget";
import { startOfDay } from "date-fns";

export const metadata = { title: "Attendance" };

export default async function AttendancePage() {
  const user = await requireAuth();
  
  let records = [];
  let todayRecord = null;

  if (user.employeeId) {
    todayRecord = await prisma.attendance.findFirst({
      where: {
        employeeId: user.employeeId,
        date: startOfDay(new Date()),
      }
    });
  }

  if (user.role === "EMPLOYEE") {
    records = await prisma.attendance.findMany({
      where: { employeeId: user.employeeId },
      orderBy: { date: "desc" },
      take: 30,
    });
  } else if (user.role === "MANAGER" && user.employeeId) {
    const team = await prisma.employee.findMany({
      where: { managerId: user.employeeId },
      select: { id: true }
    });
    const teamIds = team.map(t => t.id);
    
    records = await prisma.attendance.findMany({
      where: { employeeId: { in: [user.employeeId, ...teamIds] } },
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { date: "desc" },
      take: 50,
    });
  } else {
    records = await prisma.attendance.findMany({
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { date: "desc" },
      take: 100,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-1">
          View attendance logs and records.
        </p>
      </div>

      {user.employeeId && (
        <AttendanceWidget 
          hasCheckedIn={!!todayRecord?.checkIn}
          hasCheckedOut={!!todayRecord?.checkOut}
          checkInTime={todayRecord?.checkIn}
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No attendance records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {records.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="font-semibold">{record.employee ? record.employee.user.name : formatDate(record.date)}</p>
                      {record.employee && <p className="text-xs text-muted-foreground mt-0.5">{formatDate(record.date)}</p>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={record.status === "PRESENT" ? "success" : record.status === "ABSENT" ? "destructive" : "secondary"}>
                        {record.status}
                      </Badge>
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

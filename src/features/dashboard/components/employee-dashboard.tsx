"use client";

import { motion } from "framer-motion";
import { Clock, CalendarDays, Wallet, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { HoursLoggedChart } from "./dashboard-charts";
import { formatDate } from "@/lib/utils";
import { CheckInOutButton } from "./checkin-out-button";

interface EmployeeDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export function EmployeeDashboard({ data }: EmployeeDashboardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employeeData = data.employee as any;
  const recentAttendance = employeeData?.myAttendance || [];
  const recentLeaves = employeeData?.myLeaves || [];
  const leaveBalance = employeeData?.myLeaveBalance || [];

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = recentAttendance.find((a: any) => new Date(a.date).toISOString().split("T")[0] === todayStr) || null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-soft flex flex-col justify-center">
            <CardHeader>
              <CardTitle>Daily Action</CardTitle>
              <CardDescription>Log your time for today</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckInOutButton todayAttendance={todayAttendance} />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {leaveBalance.slice(0, 4).map((balance: any, i: number) => (
              <motion.div
                key={balance.leaveType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <Card className="flex flex-col items-center justify-center p-4 text-center h-full space-y-2 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                  <h3 className="text-xs font-semibold text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full">{balance.leaveType}</h3>
                  <CircularProgress 
                    value={balance.totalDays - balance.usedDays} 
                    max={balance.totalDays} 
                    size={72}
                    strokeWidth={6}
                    label="Days"
                    circleClassName={i === 0 ? "text-primary" : i === 1 ? "text-blue-500" : "text-emerald-500"}
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <HoursLoggedChart />
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Performance Evaluation", size: "1.24 MB", icon: "PDF" },
                  { name: "Contract Agreement", size: "800 KB", icon: "PDF" },
                  { name: "Curriculum Vitae", size: "1.05 MB", icon: "PDF" },
                  { name: "Portfolio", size: "3.5 MB", icon: "PDF" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                      {doc.icon}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent attendance records.</p>
            ) : (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recentAttendance.slice(0, 5).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{formatDate(record.date)}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "--:--"} - 
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "--:--"}
                      </p>
                    </div>
                    <Badge variant={record.status === "PRESENT" ? "success" : record.status === "ABSENT" ? "destructive" : "secondary"}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href="/attendance" className="text-sm text-primary hover:underline mt-4 inline-block">
              View full history
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Recent Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeaves.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent leave requests.</p>
            ) : (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recentLeaves.map((leave: any) => (
                  <div key={leave.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{leave.leaveType}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                      </p>
                    </div>
                    <Badge variant={leave.status === "APPROVED" ? "success" : leave.status === "REJECTED" ? "destructive" : "secondary"}>
                      {leave.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href="/leave" className="text-sm text-primary hover:underline mt-4 inline-block">
              Apply for leave
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

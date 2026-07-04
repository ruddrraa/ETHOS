"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, XCircle, CalendarOff, CalendarCheck } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const leaveData = [
  { name: "Annual Leave", used: 12, total: 20, color: "text-blue-500", bg: "bg-blue-500" },
  { name: "Sick Leave", used: 2, total: 10, color: "text-amber-500", bg: "bg-amber-500" },
  { name: "Personal", used: 1, total: 5, color: "text-purple-500", bg: "bg-purple-500" },
];

const attendanceData = [
  { name: "Present", value: 180, fill: "hsl(var(--primary))" },
  { name: "Late", value: 12, fill: "hsl(var(--chart-4))" },
  { name: "Absent", value: 5, fill: "hsl(var(--destructive))" },
];

export function EmployeeAttendanceVisuals({ employeeId }: { employeeId: string }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-emerald-500" />
              Attendance Overview (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="h-[160px] w-[160px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">91%</span>
                <span className="text-[10px] text-muted-foreground">Present</span>
              </div>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Present
                </div>
                <span className="font-bold">180 days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 text-amber-500" /> Late
                </div>
                <span className="font-bold">12 days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <XCircle className="h-4 w-4 text-red-500" /> Absent
                </div>
                <span className="font-bold">5 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarOff className="h-5 w-5 text-blue-500" />
              Leave Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {leaveData.map((leave, i) => {
              const percentage = Math.round((leave.used / leave.total) * 100);
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${leave.bg}`}></div>
                      {leave.name}
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-bold text-foreground">{leave.total - leave.used}</span> / {leave.total} left
                    </span>
                  </div>
                  <Progress value={percentage} className={`h-2 ${leave.bg.replace('bg-', 'bg-')}/20 [&>div]:${leave.bg}`} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      
      {/* Could add a detailed table of recent attendance here */}
    </div>
  );
}

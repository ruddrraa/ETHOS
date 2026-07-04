"use client";

import { motion } from "framer-motion";
import { Users, Clock, AlertTriangle, CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ManagerDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export function ManagerDashboard({ data }: ManagerDashboardProps) {
  const stats = data.stats || {};
  const team = data.team || {};
  const teamAttendance = team.teamAttendance || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "teamSize", label: "Team Size", value: team.teamSize || 0, icon: Users, color: "text-blue-500" },
          { key: "pendingLeaves", label: "Pending Approvals", value: stats.pendingLeaves || 0, icon: CalendarDays, color: "text-amber-500" },
          { key: "todayPresent", label: "Team Present Today", value: stats.todayPresent || 0, icon: Clock, color: "text-emerald-500" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Attendance Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No attendance recorded today.</p>
            ) : (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {teamAttendance.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-sm">{record.employee.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "--:--"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={record.status === "PRESENT" ? "success" : record.status === "LATE" ? "warning" : "secondary"}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href="/attendance/team" className="text-sm text-primary hover:underline mt-4 inline-block flex items-center gap-1">
              View team attendance <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

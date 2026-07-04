"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AttendanceTodayProps {
  present: number;
  late: number;
  absent: number;
  total: number;
}

export function AttendanceTodayWidget({ present, late, absent, total }: AttendanceTodayProps) {
  const presentPercent = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
  
  return (
    <Card className="h-full border-border/60 shadow-sm hover:shadow-soft transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Attendance Today
          </div>
          <span className="text-xs font-medium lowercase bg-muted px-2 py-0.5 rounded-full text-foreground">{presentPercent}% present</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-2 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              On Time
            </div>
            <span className="font-bold">{present}</span>
          </div>
          <Progress value={presentPercent} className="h-2 bg-emerald-100 [&>div]:bg-emerald-500" />
          
          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <Clock className="h-4 w-4" />
              Late
            </div>
            <span className="font-bold">{late}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <XCircle className="h-4 w-4" />
              Absent
            </div>
            <span className="font-bold">{absent}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

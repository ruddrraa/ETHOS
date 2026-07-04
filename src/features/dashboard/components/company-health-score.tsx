"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Healthy", value: 85 },
  { name: "Risk", value: 15 },
];

export function CompanyHealthScore() {
  return (
    <Card className="h-full border-border/60 shadow-sm hover:shadow-soft transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <Activity className="h-4 w-4 text-emerald-500" />
          Company Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="h-[200px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                <Cell key="cell-0" fill="hsl(var(--primary))" />
                <Cell key="cell-1" fill="hsl(var(--muted))" />
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
            <span className="text-4xl font-bold tracking-tighter">85<span className="text-xl text-muted-foreground">%</span></span>
            <span className="text-xs font-medium text-emerald-500 mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">Excellent</span>
          </div>
        </div>
        <p className="text-sm text-center text-muted-foreground -mt-6">
          Based on attendance consistency, payroll stability, and employee retention.
        </p>
      </CardContent>
    </Card>
  );
}

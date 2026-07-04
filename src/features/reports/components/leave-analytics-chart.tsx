"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Paid Leave", value: 45 },
  { name: "Sick Leave", value: 25 },
  { name: "Unpaid Leave", value: 10 },
  { name: "Maternity", value: 5 },
];

const COLORS = [
  "hsl(var(--primary))", 
  "hsl(var(--primary)/0.7)", 
  "hsl(var(--primary)/0.4)", 
  "hsl(var(--primary)/0.2)"
];

export function LeaveAnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

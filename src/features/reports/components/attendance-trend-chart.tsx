"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", present: 85, absent: 5, leave: 10 },
  { name: "Tue", present: 88, absent: 4, leave: 8 },
  { name: "Wed", present: 90, absent: 2, leave: 8 },
  { name: "Thu", present: 82, absent: 8, leave: 10 },
  { name: "Fri", present: 75, absent: 5, leave: 20 },
];

export function AttendanceTrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
        <XAxis 
          dataKey="name" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
          dy={10} 
        />
        <YAxis 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted)/0.3)" }}
          contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold", marginBottom: "4px" }}
        />
        <Bar dataKey="present" name="Present" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} stackId="a" />
        <Bar dataKey="leave" name="On Leave" fill="hsl(var(--chart-2))" radius={[4, 4, 4, 4]} stackId="b" />
        <Bar dataKey="absent" name="Absent" fill="hsl(var(--chart-3))" radius={[4, 4, 4, 4]} stackId="c" />
      </BarChart>
    </ResponsiveContainer>
  );
}

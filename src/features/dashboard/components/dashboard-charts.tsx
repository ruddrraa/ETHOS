"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

const hoursData = [
  { name: "M", hours: 8.5 },
  { name: "T", hours: 7.2 },
  { name: "W", hours: 9.1 },
  { name: "T", hours: 8.0 },
  { name: "F", hours: 6.5 },
  { name: "S", hours: 0 },
  { name: "S", hours: 0 },
];

export function HoursLoggedChart() {
  const { theme } = useTheme();
  
  return (
    <Card className="h-full flex flex-col shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Hours Logged</CardTitle>
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">This Week</span>
        </div>
        <div className="flex items-end gap-2 mt-2">
          <span className="text-3xl font-bold">39.3</span>
          <span className="text-sm text-muted-foreground pb-1">hrs</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[200px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hoursData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#333" : "#eee"} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#888" }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#888" }}
            />
            <Tooltip 
              cursor={{ fill: theme === "dark" ? "#222" : "#f5f5f5" }}
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            />
            <Bar 
              dataKey="hours" 
              fill="#10b981" 
              radius={[4, 4, 4, 4]} 
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const performanceData = [
  { month: "Jan", score: 82 },
  { month: "Feb", score: 84 },
  { month: "Mar", score: 85 },
  { month: "Apr", score: 88 },
  { month: "May", score: 86 },
  { month: "Jun", score: 89 },
];

export function PerformanceChart() {
  const { theme } = useTheme();

  return (
    <Card className="h-full flex flex-col shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Performance Overview</CardTitle>
          <span className="text-xs font-medium border px-2 py-1 rounded-md">Last 6 Months</span>
        </div>
        <div className="flex items-end gap-2 mt-2">
          <span className="text-3xl font-bold">86.75%</span>
          <span className="text-sm text-emerald-500 font-medium pb-1">+2.4%</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[200px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#333" : "#eee"} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#888" }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#888" }}
              domain={[60, 100]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { motion } from "framer-motion";
import { Users, Building2, Clock, CalendarDays, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HeadcountGrowthChart } from "./headcount-growth-chart";
import { CompanyHealthScore } from "./company-health-score";
import { AttendanceTodayWidget } from "./attendance-today-widget";
import { DepartmentDistributionChart } from "./department-distribution-chart";

interface AdminDashboardProps {
  data: {
    stats?: {
      totalEmployees?: number;
      totalDepartments?: number;
      pendingLeaves?: number;
      todayPresent?: number;
      todayLate?: number;
      todayAbsent?: number;
    };
    monthlyPayroll?: {
      title: string;
      totalAmount: number;
      employeeCount: number;
    } | null;
  };
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const stats = data.stats || {};
  const monthlyPayroll = data.monthlyPayroll;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "totalEmployees", label: "Total Employees", value: stats.totalEmployees || 0, icon: Users, href: "/employees", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
          { key: "totalDepartments", label: "Departments", value: stats.totalDepartments || 0, icon: Building2, href: "/departments", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
          { key: "pendingLeaves", label: "Pending Leaves", value: stats.pendingLeaves || 0, icon: CalendarDays, href: "/leave", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
          { key: "todayPresent", label: "Present Today", value: stats.todayPresent || 0, icon: Clock, href: "/attendance", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between h-full p-6">
                  <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      {card.label}
                    </CardTitle>
                    <div className={cn("p-2.5 rounded-full flex items-center justify-center shrink-0", card.bg, card.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-primary transition-colors">
                      View details <ArrowRight className="h-3 w-3" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HeadcountGrowthChart />
        </div>
        <div>
          <CompanyHealthScore />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <AttendanceTodayWidget 
            present={stats.todayPresent || 0}
            late={stats.todayLate || 0} // Using present as proxy if late not separated
            absent={stats.todayAbsent || 0}
            total={stats.totalEmployees || 0}
          />
        </div>
        <div>
          <DepartmentDistributionChart />
        </div>
        {monthlyPayroll && (
          <Card className="h-full border-border/60 shadow-sm hover:shadow-soft transition-all duration-300 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Wallet className="h-4 w-4 text-primary" />
                Latest Payroll Run
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-center space-y-2">
                <p className="font-medium text-lg">{monthlyPayroll.title}</p>
                <div className="text-4xl font-bold tracking-tight text-primary">
                  {formatCurrency(monthlyPayroll.totalAmount)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Processed for {monthlyPayroll.employeeCount} employees
                </p>
                <div className="pt-4">
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-4 py-1">
                    Successfully Completed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

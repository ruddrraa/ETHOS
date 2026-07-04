import { requireAuth } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Download, Users, Calendar, Wallet, FileText, ArrowUpRight } from "lucide-react";
import { ReportGenerator } from "@/features/reports/components/report-generator";
import { GlobalExportButton } from "@/features/reports/components/global-export-button";
import { AttendanceTrendChart } from "@/features/reports/components/attendance-trend-chart";
import { LeaveAnalyticsChart } from "@/features/reports/components/leave-analytics-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HeadcountGrowthChart } from "@/features/dashboard/components/headcount-growth-chart";
import { DepartmentDistributionChart } from "@/features/dashboard/components/department-distribution-chart";

export const metadata = { title: "Enterprise Analytics" };

export default async function ReportsPage() {
  await requireAuth();

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Center</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive organization insights and exportable reports.
          </p>
        </div>
        <GlobalExportButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Reports Generated", value: "142", trend: "+12%", icon: FileText, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
          { title: "Avg. Daily Attendance", value: "94%", trend: "+2.1%", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
          { title: "Monthly Attrition Rate", value: "1.2%", trend: "-0.4%", icon: Users, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
          { title: "Total Payroll Exp.", value: "$124.5k", trend: "+4.5%", icon: Wallet, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/60 shadow-sm hover:shadow-soft transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm font-medium text-emerald-600">
                <ArrowUpRight className="h-4 w-4" />
                {stat.trend} <span className="text-muted-foreground font-normal ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance & Leaves</TabsTrigger>
          <TabsTrigger value="hr">HR & Headcount</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
               <HeadcountGrowthChart />
            </div>
            <div>
               <DepartmentDistributionChart />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Attendance Trends</CardTitle>
                  <CardDescription>Weekly present vs absent rates</CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full pt-4">
                  <AttendanceTrendChart />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Leave Distribution</CardTitle>
                  <CardDescription>Breakdown by leave types</CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full pt-4">
                  <LeaveAnalyticsChart />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card className="border-dashed bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Generate Custom Data Export
              </CardTitle>
              <CardDescription>
                Select filters and date ranges to generate a CSV or PDF report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportGenerator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

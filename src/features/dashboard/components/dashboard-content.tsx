"use client";

import { Megaphone } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { EmployeeDashboard } from "./employee-dashboard";
import { ManagerDashboard } from "./manager-dashboard";
import { AdminDashboard } from "./admin-dashboard";

interface DashboardContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  userName: string;
}

export function DashboardContent({ data, userName }: DashboardContentProps) {
  const announcements = (data.recentAnnouncements ?? []) as Array<{
    id: string;
    title: string;
    content: string;
    publishedAt: string;
    isPinned: boolean;
  }>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const role = data.role as string;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {userName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening in your organization today.
        </p>
      </div>

      {role === "EMPLOYEE" ? (
        <EmployeeDashboard data={data} />
      ) : role === "MANAGER" ? (
        <ManagerDashboard data={data} />
      ) : (
        <AdminDashboard data={data} />
      )}

      {/* Announcements are global for all roles */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
            <CardDescription>Latest company updates</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No announcements yet.
              </p>
            ) : (
              <div className="space-y-4">
                {announcements.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{item.title}</p>
                        {item.isPinned && <Badge variant="secondary">Pinned</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(item.publishedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/announcements" className="text-sm text-primary hover:underline mt-4 inline-block">
              View all announcements
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

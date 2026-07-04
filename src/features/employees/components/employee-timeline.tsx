"use client";

import { useEffect, useState } from "react";
import { History, Activity, CalendarDays, Wallet, UserCog, Briefcase, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  action: string;
  entity: string;
  details: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export function EmployeeTimeline({ employeeId }: { employeeId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real implementation, this would fetch from /api/employees/[id]/timeline
  // which queries the AuditLog table where entityId = employeeId
  useEffect(() => {
    // Mocking the timeline for demonstration of the UI layout
    setTimeout(() => {
      setEvents([
        {
          id: "1",
          action: "UPDATE",
          entity: "Employee",
          details: "Updated Job Title to 'Senior Engineer'",
          createdAt: new Date().toISOString(),
          user: { name: "HR Admin", email: "hr@company.com" }
        },
        {
          id: "2",
          action: "CREATE",
          entity: "SalaryStructure",
          details: "Initialized new payroll structure",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          user: { name: "System", email: "system@ethos.io" }
        },
        {
          id: "3",
          action: "CREATE",
          entity: "Employee",
          details: "Onboarded employee into the system",
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
          user: { name: "Super Admin", email: "admin@company.com" }
        }
      ]);
      setLoading(false);
    }, 500);
  }, [employeeId]);

  const getIconForEntity = (entity: string, action: string) => {
    if (action === "UPDATE") return <Activity className="h-4 w-4 text-blue-500" />;
    if (entity === "SalaryStructure") return <Wallet className="h-4 w-4 text-emerald-500" />;
    if (entity === "Employee") return <UserCog className="h-4 w-4 text-primary" />;
    if (entity === "LeaveRequest") return <CalendarDays className="h-4 w-4 text-amber-500" />;
    return <Briefcase className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-primary/10">
                {getIconForEntity(event.entity, event.action)}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-soft transition-all">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-semibold text-sm capitalize text-foreground">
                    {event.action.toLowerCase()} {event.entity}
                  </div>
                  <time className="font-mono text-xs text-muted-foreground">
                    {formatDate(event.createdAt)}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.details}
                </p>
                <div className="mt-3 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                    {event.user?.name.charAt(0)}
                  </div>
                  <span>{event.user?.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto">
            Load More <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-300",
        isCollapsed ? "pl-28" : "pl-[18rem]"
      )}
    >
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  Wallet,
  FileText,
  BarChart3,
  Megaphone,
  Bell,
  Sparkles,
  Brain,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, hasPermission, type Permission } from "@/lib/rbac/permissions";
import type { Role } from "@prisma/client";
import { useSidebarStore } from "@/stores/sidebar.store";

const iconMap = {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  Wallet,
  FileText,
  BarChart3,
  Megaphone,
  Bell,
  Sparkles,
  Brain,
  Shield,
  Settings,
};

interface SidebarProps {
  userRole: Role;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();

  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(userRole, item.permission as Permission)
  );

  return (
    <aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 flex flex-col rounded-3xl bg-card shadow-soft transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-20 items-center justify-between px-6">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="ETHOS Logo" className="h-20 w-48 object-contain origin-left" />
          </Link>
        )}
        <button
          onClick={toggle}
          className="rounded-full p-2 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-none">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-[1.02]",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-white")} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

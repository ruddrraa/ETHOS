import type { Role } from "@prisma/client";

export type Permission =
  | "dashboard:view"
  | "employees:view"
  | "employees:create"
  | "employees:update"
  | "employees:delete"
  | "departments:view"
  | "departments:create"
  | "departments:update"
  | "departments:delete"
  | "attendance:view"
  | "attendance:manage"
  | "attendance:checkin"
  | "leave:view"
  | "leave:apply"
  | "leave:approve"
  | "leave:manage"
  | "payroll:view"
  | "payroll:manage"
  | "payroll:process"
  | "documents:view"
  | "documents:upload"
  | "documents:delete"
  | "notifications:view"
  | "announcements:view"
  | "announcements:create"
  | "announcements:manage"
  | "reports:view"
  | "reports:export"
  | "audit:view"
  | "settings:view"
  | "settings:manage"
  | "users:manage"
  | "ai:use"
  | "ai:insights";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard:view",
    "employees:view",
    "employees:create",
    "employees:update",
    "employees:delete",
    "departments:view",
    "departments:create",
    "departments:update",
    "departments:delete",
    "attendance:view",
    "attendance:manage",
    "attendance:checkin",
    "leave:view",
    "leave:apply",
    "leave:approve",
    "leave:manage",
    "payroll:view",
    "payroll:manage",
    "payroll:process",
    "documents:view",
    "documents:upload",
    "documents:delete",
    "notifications:view",
    "announcements:view",
    "announcements:create",
    "announcements:manage",
    "reports:view",
    "reports:export",
    "audit:view",
    "settings:view",
    "settings:manage",
    "users:manage",
    "ai:use",
    "ai:insights",
  ],
  HR: [
    "dashboard:view",
    "employees:view",
    "employees:create",
    "employees:update",
    "employees:delete",
    "departments:view",
    "departments:create",
    "departments:update",
    "attendance:view",
    "attendance:manage",
    "attendance:checkin",
    "leave:view",
    "leave:apply",
    "leave:approve",
    "leave:manage",
    "payroll:view",
    "payroll:manage",
    "payroll:process",
    "documents:view",
    "documents:upload",
    "documents:delete",
    "notifications:view",
    "announcements:view",
    "announcements:create",
    "announcements:manage",
    "reports:view",
    "reports:export",
    "ai:use",
    "ai:insights",
  ],
  MANAGER: [
    "dashboard:view",
    "employees:view",
    "departments:view",
    "attendance:view",
    "attendance:checkin",
    "leave:view",
    "leave:apply",
    "leave:approve",
    "documents:view",
    "documents:upload",
    "notifications:view",
    "announcements:view",
    "reports:view",
    "ai:use",
  ],
  EMPLOYEE: [
    "dashboard:view",
    "attendance:view",
    "attendance:checkin",
    "leave:view",
    "leave:apply",
    "payroll:view",
    "documents:view",
    "documents:upload",
    "notifications:view",
    "announcements:view",
    "ai:use",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "HR",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

export const NAV_ITEMS: {
  title: string;
  href: string;
  icon: string;
  permission: Permission;
}[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", permission: "dashboard:view" },
  { title: "Employees", href: "/employees", icon: "Users", permission: "employees:view" },
  { title: "Departments", href: "/departments", icon: "Building2", permission: "departments:view" },
  { title: "Attendance", href: "/attendance", icon: "Clock", permission: "attendance:view" },
  { title: "Leave", href: "/leave", icon: "CalendarDays", permission: "leave:view" },
  { title: "Payroll", href: "/payroll", icon: "Wallet", permission: "payroll:view" },
  { title: "Documents", href: "/documents", icon: "FileText", permission: "documents:view" },
  { title: "Reports", href: "/reports", icon: "BarChart3", permission: "reports:view" },
  { title: "Announcements", href: "/announcements", icon: "Megaphone", permission: "announcements:view" },
  { title: "Notifications", href: "/notifications", icon: "Bell", permission: "notifications:view" },
  { title: "AI Assistant", href: "/ai", icon: "Sparkles", permission: "ai:use" },
  { title: "AI Insights", href: "/ai/insights", icon: "Brain", permission: "ai:insights" },
  { title: "Audit Logs", href: "/audit-logs", icon: "Shield", permission: "audit:view" },
  { title: "Settings", href: "/settings", icon: "Settings", permission: "settings:view" },
];

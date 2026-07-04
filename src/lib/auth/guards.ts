import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac/permissions";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  if (!hasPermission(user.role as Role, permission)) {
    redirect("/unauthorized");
  }
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as Role)) {
    redirect("/unauthorized");
  }
  return user;
}

export function checkPermission(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}

import { requireAuth } from "@/lib/auth/guards";
import { getDashboardStats } from "@/features/dashboard/services/dashboard.service";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import type { Role } from "@prisma/client";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireAuth();
  const data = await getDashboardStats(user.id, user.role as Role, user.employeeId);

  return <DashboardContent data={data} userName={user.name ?? "User"} />;
}

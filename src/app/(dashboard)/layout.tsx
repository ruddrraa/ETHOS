import { requireAuth } from "@/lib/auth/guards";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getUnreadCount } from "@/lib/services/notification.service";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { Role } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const unreadCount = await getUnreadCount(user.id);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={user.role as Role} />
      <DashboardShell>
        <Header
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          }}
          unreadNotifications={unreadCount}
        />
        <main className="flex-1 p-6 pt-24">{children}</main>
      </DashboardShell>
    </div>
  );
}

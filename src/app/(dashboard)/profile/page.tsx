import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireAuth();
  
  const employeeData = user.employeeId ? await prisma.employee.findUnique({
    where: { id: user.employeeId },
    include: { department: true, manager: { include: { user: true } } }
  }) : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal and professional information.
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-2xl">{getInitials(user.name ?? user.email)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge className="mt-2" variant="secondary">{user.role.replace("_", " ")}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {employeeData ? (
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                <p className="text-sm mt-1">{employeeData.employeeId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                <p className="text-sm mt-1">{employeeData.jobTitle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-sm mt-1">{employeeData.department?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manager</p>
                <p className="text-sm mt-1">{employeeData.manager?.user.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={employeeData.status === "ACTIVE" ? "success" : "secondary"} className="mt-1">
                  {employeeData.status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">No employee profile linked to this account.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

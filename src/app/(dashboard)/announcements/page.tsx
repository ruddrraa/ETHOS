import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import { CreateAnnouncementForm } from "@/features/announcements/components/create-announcement-form";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const user = await requireAuth();
  
  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: [
      { isPinned: "desc" },
      { publishedAt: "desc" }
    ],
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Stay up to date with company news and announcements.
        </p>
      </div>

      {["SUPER_ADMIN", "HR"].includes(user.role) && (
        <Card className="mb-6 border-dashed bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>New Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateAnnouncementForm />
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No announcements found.</p>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {announcement.isPinned && <Megaphone className="h-4 w-4 text-primary" />}
                    {announcement.title}
                  </CardTitle>
                  {announcement.isPinned && <Badge variant="secondary">Pinned</Badge>}
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  Published on {formatDate(announcement.publishedAt)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

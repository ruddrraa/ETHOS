import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { DocumentUploadForm } from "@/features/documents/components/document-upload-form";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const user = await requireAuth();
  
  let documents = [];

  if (user.role === "EMPLOYEE") {
    documents = await prisma.document.findMany({
      where: { employeeId: user.employeeId },
      orderBy: { createdAt: "desc" },
    });
  } else {
    documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1">
          Manage company and employee documents.
        </p>
      </div>

      <Card className="mb-6 border-dashed bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xl">
            <DocumentUploadForm />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No documents found.</p>
          ) : (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-4 border-b pb-2 last:border-0">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

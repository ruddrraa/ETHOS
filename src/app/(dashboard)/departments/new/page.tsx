import { requirePermission } from "@/lib/auth/guards";
import { DepartmentForm } from "@/features/departments/components/department-form";

export const metadata = { title: "New Department" };

export default async function NewDepartmentPage() {
  await requirePermission("departments:create");

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Department</h1>
        <p className="text-muted-foreground mt-1">
          Create a new department in the organization.
        </p>
      </div>
      
      <DepartmentForm />
    </div>
  );
}

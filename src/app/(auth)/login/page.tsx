import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

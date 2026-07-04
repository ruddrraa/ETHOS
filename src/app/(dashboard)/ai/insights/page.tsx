import { requirePermission } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp } from "lucide-react";

export const metadata = { title: "AI Insights" };

export default async function AIInsightsPage() {
  await requirePermission("ai:insights");

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI Insights
        </h1>
        <p className="text-muted-foreground mt-1">
          Predictive analytics and intelligent recommendations for your organization.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Retention Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              AI analysis indicates a healthy retention rate. The Engineering department has seen a 12% increase in average tenure.
            </p>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-3/4"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">Low Risk (15%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Leave Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We detect an upcoming spike in leave requests for the upcoming holiday season. Consider reviewing approval coverage.
            </p>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-1/2"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">Medium Impact</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

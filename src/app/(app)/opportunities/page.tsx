import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-muted-foreground">Find your next project or collaboration.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed text-muted-foreground">
            <Briefcase className="h-12 w-12" />
            <p>The opportunities marketplace is under construction.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

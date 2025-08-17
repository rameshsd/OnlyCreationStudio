import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Briefcase, Bot, Users } from "lucide-react";
import Link from "next/link";

const dashboardCards = [
  {
    title: "Find Your Match",
    description: "Let our AI find the perfect creators for your next campaign.",
    icon: Bot,
    href: "/matchmaker",
    cta: "Start Matching",
  },
  {
    title: "Discover Opportunities",
    description: "Browse the latest projects and collaborations from top brands.",
    icon: Briefcase,
    href: "/opportunities",
    cta: "Browse Jobs",
  },
  {
    title: "My Network",
    description: "Manage your connections and build your dream team.",
    icon: Users,
    href: "/connections",
    cta: "View Network",
  },
  {
    title: "Recent Activity",
    description: "Keep track of your likes, comments, and collaboration requests.",
    icon: Activity,
    href: "/activity",
    cta: "View Activity",
  }
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">Here's a snapshot of what's happening on Creator Canvas.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex flex-col space-y-1.5">
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={card.href}>{card.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>A list of projects you might be interested in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">No recent projects to show.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

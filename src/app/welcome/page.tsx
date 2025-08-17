import Link from "next/link";
import { Building2, User, Wrench, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

const roles = [
  {
    icon: Building2,
    title: "Brand",
    description: "Hire creators, launch products, and manage campaigns.",
    href: "/",
  },
  {
    icon: User,
    title: "Creator / Influencer",
    description: "Showcase your work, find collaborations, and grow your audience.",
    href: "/",
  },
  {
    icon: Wrench,
    title: "Service Provider / Freelancer",
    description: "Offer your skills, connect with clients, and manage projects.",
    href: "/",
  },
  {
    icon: Camera,
    title: "Studio",
    description: "List your space, manage bookings, and attract clients.",
    href: "/",
  },
];

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <Logo className="mb-6 h-12 w-auto" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Welcome to Creator Canvas
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            The ultimate platform for creators and brands to connect and collaborate. Choose your role to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.title} className="group transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
              <Link href={role.href} className="flex h-full flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <role.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{role.title}</CardTitle>
                    <CardDescription className="mt-1">{role.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow" />
                <div className="flex items-center justify-end p-4 pt-0">
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button variant="link" asChild>
            <Link href="/">Skip for now &rarr;</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}



"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Bot,
  FileText,
  Briefcase,
  MessageSquare,
  Settings,
  Moon,
  Sun,
  Video,
  User,
  Users,
  Star,
  PlusCircle,
  Camera,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/shorts", label: "Shorts", icon: Video },
  { href: "/matchmaker", label: "AI Matchmaker", icon: Bot },
  { href: "/ai-job-builder", label: "AI Job Builder", icon: FileText },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/studios", label: "Studios", icon: Camera },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/collab-requests", label: "Collab Requests", icon: Users },
  { href: "/favourites", label: "Favourites", icon: Star },
  { href: "/team-builder", label: "Team Builder", icon: PlusCircle },
  { href: "/profile", label: "Profile", icon: User },
];

function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function MobileSidebar() {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <LayoutGrid />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <Logo className="w-36" />
          </div>
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  pathname.startsWith(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DesktopSidebar() {
    const pathname = usePathname();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background p-2 sm:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        <Link href="/dashboard" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/dashboard" ? "text-primary" : "text-muted-foreground")}>
          <Home />
          <span className="text-xs">Feed</span>
        </Link>
        <Link href="/explore" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/explore" ? "text-primary" : "text-muted-foreground")}>
          <Search />
          <span className="text-xs">Explore</span>
        </Link>
        <Button asChild size="lg" className="rounded-full w-14 h-14 shadow-lg"><Link href="/create"><Plus/></Link></Button>
        <Link href="/messages" className={cn("flex flex-col items-center justify-center gap-1", pathname.startsWith("/messages") ? "text-primary" : "text-muted-foreground")}>
          <MessageSquare />
          <span className="text-xs">Chats</span>
        </Link>
        <Link href="/profile" className={cn("flex flex-col items-center justify-center gap-1", pathname.startsWith("/profile") ? "text-primary" : "text-muted-foreground")}>
          <Avatar className="h-7 w-7"><AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="avatar user" /></Avatar>
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {isMobile ? (
        <>
          <main className="p-4 pb-24">{children}</main>
          <DesktopSidebar />
        </>
      ) : (
        <div className="flex">
          <aside className="fixed left-0 top-0 h-screen w-64 border-r">
            <div className="flex h-full flex-col">
              <div className="border-b p-4 h-20 flex items-center">
                <Logo className="w-36" />
              </div>
              <nav className="flex-1 space-y-2 p-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                      usePathname().startsWith(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 mt-auto">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center justify-start gap-3 w-full">
                       <Avatar className="h-10 w-10">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="avatar user" />
                        <AvatarFallback>CC</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">User Name</p>
                        <p className="text-xs text-muted-foreground">@username</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 mb-2">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem><ThemeToggle/> Toggle Theme</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </aside>
          <main className="ml-64 flex-1 p-6">{children}</main>
        </div>
      )}
    </div>
  );
}

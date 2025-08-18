
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
  Plus
} from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import React from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { ModeToggle } from "./mode-toggle";

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
];

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
      <SheetContent side="left" className="bg-background p-0 w-72">
        <SheetHeader className="p-4 border-b">
           <Logo className="w-36" />
           <SheetTitle className="sr-only">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  pathname.startsWith(item.href)
                    ? "bg-primary/10 text-primary font-semibold"
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

function BottomNavBar() {
    const pathname = usePathname();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur-sm p-2 lg:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        <Link href="/dashboard" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/dashboard" ? "text-primary" : "text-muted-foreground")}>
          <Home />
          <span className="text-xs font-medium">Feed</span>
        </Link>
        <Link href="/explore" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/explore" ? "text-primary" : "text-muted-foreground")}>
          <Search />
          <span className="text-xs font-medium">Explore</span>
        </Link>
        <Button asChild size="lg" className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 scale-110 -translate-y-2">
            <Link href="/create">
                <Plus className="h-6 w-6"/>
                <span className="sr-only">Create</span>
            </Link>
        </Button>
        <Link href="/messages" className={cn("flex flex-col items-center justify-center gap-1", pathname.startsWith("/messages") ? "text-primary" : "text-muted-foreground")}>
          <MessageSquare />
          <span className="text-xs font-medium">Chats</span>
        </Link>
        <Link href="/profile" className={cn("flex flex-col items-center justify-center gap-1", pathname.startsWith("/profile") ? "text-primary" : "text-muted-foreground")}>
          <Avatar className="h-7 w-7 border-2 border-transparent group-hover:border-primary transition-colors">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="avatar user" />
          </Avatar>
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  
  const isShortsPage = pathname === '/shorts';

  if (isMobile === undefined) {
    return <div className="flex min-h-screen w-full items-center justify-center"><p>Loading...</p></div>
  }

  return (
    <div className="min-h-screen w-full bg-secondary/50 dark:bg-card">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background hidden lg:flex flex-col">
            <div className="flex h-20 items-center border-b px-6">
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
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 mt-auto border-t">
                 <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-start gap-3 w-full h-auto p-2">
                     <Avatar className="h-10 w-10">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="avatar user" />
                      <AvatarFallback>CC</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold">User Name</p>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </aside>

        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm p-4 h-20 lg:hidden">
            <MobileSidebar />
            <Logo className="w-32" />
            <ModeToggle />
        </header>

         <main
          className={cn(
            'w-full lg:ml-64',
            isShortsPage
              ? 'h-[calc(100vh-80px)] lg:h-screen'
              : 'pt-20 lg:pt-0 lg:p-6 p-4 pb-24'
          )}
        >
          {children}
        </main>
      </div>
      {isMobile && <BottomNavBar />}
    </div>
  );
}

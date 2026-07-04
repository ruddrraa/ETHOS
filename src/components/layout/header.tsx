"use client";

import { signOut } from "next-auth/react";
import { Moon, Sun, LogOut, User, Menu, Search, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CommandPalette } from "./command-palette";

interface HeaderProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
  unreadNotifications?: number;
}

export function Header({ user, unreadNotifications = 0 }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { isCollapsed } = useSidebarStore();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-20 items-center justify-between bg-background/60 backdrop-blur-md px-8 transition-all duration-300",
        isCollapsed ? "left-28" : "left-[18rem]"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="relative hidden md:flex items-center w-full max-w-md">
          <CommandPalette />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Link href="/notifications" className="relative">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm" aria-label="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </Button>
        </Link>
        
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>

        <Link href="/profile">
          <Button variant="ghost" size="icon" aria-label="Profile">
            <User className="h-4 w-4" />
          </Button>
        </Link>

        <div className="hidden md:flex items-center gap-3 ml-2 pl-4">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback>{getInitials(user.name ?? user.email)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-semibold leading-none">{user.name}</p>
            <p className="text-muted-foreground text-xs mt-1 capitalize">{user.role.replace("_", " ").toLowerCase()}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full ml-2"
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}

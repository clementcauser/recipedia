"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = authClient.useSession();

  // Filter out the account item from the main list as it will be at the bottom
  const mainNavItems = navItems.filter((item) => item.href !== "/settings");

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Déconnexion réussie");
      router.push("/login");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card min-h-screen sticky top-0 transition-all duration-300 ease-in-out z-50",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header & Toggle */}
      <div
        className={cn(
          "p-6 flex items-center justify-between",
          isCollapsed && "justify-center px-2",
        )}
      >
        {!isCollapsed && (
          <Link
            href="/"
            className="font-bold text-2xl flex items-center gap-2 text-primary overflow-hidden whitespace-nowrap"
          >
            <span>Recipedia</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-muted-foreground"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
            >
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-base font-medium transition-all duration-200",
                  isCollapsed ? "justify-center px-0" : "px-4",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto border-t space-y-1 p-4">
        {/* User Profile & Logout */}
        {session && (
          <div
            className={cn(
              "pt-4 flex flex-col gap-2",
              isCollapsed ? "items-center" : "items-start",
            )}
          >
            <Link
              href="/settings"
              className="w-full"
              title={isCollapsed ? "Paramètres" : undefined}
            >
              <div
                className={cn(
                  "flex items-center gap-3 w-full p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer",
                  isCollapsed && "justify-center",
                )}
              >
                <UserCircle className="h-8 w-8 text-muted-foreground shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-foreground">
                      {session.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "sm"}
              onClick={handleSignOut}
              className={cn(
                "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                !isCollapsed ? "justify-start gap-3 px-4" : "justify-center",
              )}
              title={isCollapsed ? "Déconnexion" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Déconnexion</span>}
            </Button>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t opacity-50">
          <p className="text-xs text-center text-muted-foreground">
            © 2024 Recipedia
          </p>
        </div>
      )}
    </aside>
  );
}

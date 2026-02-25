"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe">
      <nav className="flex items-center justify-around h-16 relative">
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          // Insert the "+" button in the middle
          const isMiddle = index === Math.floor(navItems.length / 2);

          return (
            <div key={item.href}>
              {isMiddle && (
                <Link
                  href="/recipes/new"
                  className="flex flex-col items-center justify-center h-12 w-12 -mt-10 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/40 border-4 border-background transition-transform active:scale-90 z-50"
                >
                  <span className="text-2xl font-bold">+</span>
                </Link>
              )}
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200",
                  isActive
                    ? "text-emerald-500"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-6 w-6",
                    isActive && "scale-110 transition-transform",
                  )}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-2 h-1 w-1 rounded-full bg-emerald-500" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Header() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

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
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <span>Recipedia</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <nav className="flex items-center gap-4">
            {session ? (
              <div className="md:hidden flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {session.user.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">S'inscrire</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

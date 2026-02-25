import { ProfileForm } from "@/components/settings/profile-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Modifier le profil - Recipedia",
  description: "Gérez vos informations personnelles.",
};

export default function ProfileSettingsPage() {
  return (
    <div className="container max-w-2xl py-10 px-4 mx-auto">
      <div className="mb-8">
        <Link href="/settings">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 mb-4 -ml-2 text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux paramètres
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre nom d'affichage et votre avatar.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}

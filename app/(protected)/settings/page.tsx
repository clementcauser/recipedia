import Link from "next/link";
import { User, ShieldCheck, Bell, Palette, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const sections = [
    {
      title: "Profil",
      description:
        "Gérez votre nom, votre avatar et vos informations personnelles.",
      icon: User,
      href: "/settings/profile",
    },
    {
      title: "Sécurité",
      description: "Protégez votre compte : email, mot de passe et sécurité.",
      icon: ShieldCheck,
      href: "/settings/security",
    },
    {
      title: "Préférences publiques",
      description:
        "Gérez votre profil public et la visibilité de vos recettes.",
      icon: User,
      href: "/settings/public",
      comingSoon: true,
    },
    {
      title: "Apparence",
      description: "Personnalisez l'affichage de l'application.",
      icon: Palette,
      href: "/settings/appearance",
      comingSoon: true,
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les préférences de votre compte et de l'application.
        </p>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.comingSoon ? "#" : section.href}
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
                  <section.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    {section.comingSoon && (
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium uppercase tracking-wider text-muted-foreground">
                        Bientôt
                      </span>
                    )}
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

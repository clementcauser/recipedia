import { Home, Notebook as Recipes, Users, User } from "lucide-react";

export const navItems = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    label: "Mes Recettes",
    href: "/recipes",
    icon: Recipes,
  },
  {
    label: "Communauté",
    href: "/community",
    icon: Users,
  },
  {
    label: "Compte",
    href: "/settings",
    icon: User,
  },
];

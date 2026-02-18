import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/session";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublié | Recipedia",
  description: "Réinitialisez votre mot de passe",
};

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();

  // Si déjà connecté, rediriger vers dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <KeyRound className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mot de passe oublié ?
          </h1>
          <p className="text-sm text-muted-foreground">
            Pas de problème, nous allons vous aider à le réinitialiser
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Réinitialiser votre mot de passe</CardTitle>
            <CardDescription>
              Entrez votre adresse email pour recevoir un lien de
              réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

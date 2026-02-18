import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/session";
import { VerifyEmailForm } from "@/components/forms/VerifyEmailForm";

export const metadata = {
  title: "Vérifier votre email | Votre App",
  description: "Vérifiez votre adresse email pour continuer",
};

export default async function VerifyEmailPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.emailVerified) {
    redirect("/dashboard");
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Mail className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vérifiez votre email
          </h1>
          <p className="text-sm text-muted-foreground">
            Nous avons envoyé un code à 6 chiffres à
          </p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Code de vérification</CardTitle>
            <CardDescription>Entrez le code reçu par email</CardDescription>
          </CardHeader>
          <CardContent>
            <VerifyEmailForm />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Le code expire dans 10 minutes
        </p>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/session";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata = {
  title: "Réinitialiser votre mot de passe | Recipedia",
  description: "Définissez un nouveau mot de passe pour votre compte",
};

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const user = await getCurrentUser();

  // Si déjà connecté, rediriger vers dashboard
  if (user) {
    redirect("/dashboard");
  }

  const token = searchParams.token;

  // Si pas de token, afficher une erreur
  if (!token) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Lien invalide</CardTitle>
              <CardDescription>
                Le lien de réinitialisation est manquant ou invalide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Token manquant</AlertTitle>
                <AlertDescription>
                  Le lien de réinitialisation que vous avez utilisé est
                  incomplet. Veuillez vérifier votre email et cliquer sur le bon
                  lien.
                </AlertDescription>
              </Alert>

              <div className="mt-6 flex flex-col items-center gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/forgot-password">Demander un nouveau lien</a>
                </Button>

                <Button variant="ghost" className="w-full" asChild>
                  <a href="/login">Retour à la connexion</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-muted-foreground">
            Choisissez un mot de passe sécurisé pour votre compte
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Réinitialiser votre mot de passe</CardTitle>
            <CardDescription>
              Créez un nouveau mot de passe fort et sécurisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm token={token} />
          </CardContent>
        </Card>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Conseil de sécurité</AlertTitle>
          <AlertDescription className="text-xs">
            Utilisez un mot de passe unique que vous n&apos;utilisez nulle part
            ailleurs. Évitez les informations personnelles facilement
            devinables.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

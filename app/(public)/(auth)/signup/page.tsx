import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/session";
import { SignupForm } from "@/components/forms/SignupForm";

export const metadata = {
  title: "Créer un compte | Recipedia",
  description:
    "Créez votre compte pour accéder à Recipedia et découvrir des recettes délicieuses.",
};

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <UserPlus className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Créer votre compte
          </h1>
          <p className="text-sm text-muted-foreground">
            Rejoignez-nous et commencez votre aventure
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Remplissez le formulaire pour créer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          En créant un compte, vous acceptez de recevoir des communications de
          notre part. Vous pouvez vous désabonner à tout moment.
        </p>
      </div>
    </div>
  );
}

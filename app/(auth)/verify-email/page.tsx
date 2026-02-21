import { MailCheck } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Vérifiez votre e-mail",
  description: "Vérifiez votre e-mail pour le lien de vérification",
};

export default function VerifyEmailPage() {
  return (
    <div className="flex justify-center items-center min-vh-100 py-12">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Vérifiez votre e-mail</CardTitle>
          <CardDescription>
            Nous vous avons envoyé un lien de vérification. Veuillez vérifier votre e-mail et cliquer sur le lien pour vérifier votre compte.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

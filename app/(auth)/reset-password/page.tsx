import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const metadata = {
  title: "Réinitialiser votre mot de passe",
  description: "Créer un nouveau mot de passe",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center items-center min-vh-100 py-12">
      <Suspense fallback={<div>Chargement...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

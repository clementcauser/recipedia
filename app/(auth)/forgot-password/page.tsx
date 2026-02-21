import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez votre mot de passe",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex justify-center items-center min-vh-100 py-12">
      <ForgotPasswordForm />
    </div>
  );
}

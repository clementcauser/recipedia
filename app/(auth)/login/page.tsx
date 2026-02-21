import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
};

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-vh-100 py-12">
      <LoginForm />
    </div>
  );
}

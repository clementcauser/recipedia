import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Inscription",
  description: "Créer un compte",
};

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-vh-100 py-12">
      <RegisterForm />
    </div>
  );
}

import { SecuritySettings } from "@/components/settings/security-settings";

export const metadata = {
  title: "Paramètres de sécurité",
  description: "Gérez votre A2F et vos paramètres de sécurité.",
};

export default function SecurityPage() {
  return (
    <div className="container max-w-2xl py-12 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres de sécurité</h1>
        <p className="text-muted-foreground mt-2">
          Gérez la sécurité de votre compte et l'authentification à deux facteurs.
        </p>
      </div>
      
      <SecuritySettings />
    </div>
  );
}

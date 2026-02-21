"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      toast.error("Le mot de passe doit comporter au moins 8 caractères");
      return;
    }

    setIsPending(true);
    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token: token || "",
      });

      if (error) {
        toast.error(
          error.message ||
            "Une erreur est survenue lors de la réinitialisation",
        );
        return;
      }

      toast.success("Votre mot de passe a été réinitialisé avec succès.");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Une erreur inattendue est survenue");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Nouveau mot de passe</CardTitle>
        <CardDescription>
          Veuillez entrer votre nouveau mot de passe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Entrez-le à nouveau"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !password || !confirmPassword}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Réinitialiser
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

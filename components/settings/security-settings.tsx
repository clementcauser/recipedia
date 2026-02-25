"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

export function SecuritySettings() {
  const { data: session, isPending: isSessionLoading } = useSession();

  // Email states
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [email, setEmail] = useState(session?.user?.email || "");

  // Password states
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update email when session loaded
  if (session?.user?.email && email === "" && !isSessionLoading) {
    setEmail(session.user.email);
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === session?.user?.email) {
      toast.info("L'adresse email est déjà celle-ci.");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail: email,
      });

      if (error) {
        toast.error(error.message || "Erreur lors du changement d'email.");
      } else {
        toast.success(
          "Demande de changement d'email envoyée ! Vérifiez votre boîte de réception.",
        );
      }
    } catch (err) {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(
          error.message || "Erreur lors du changement de mot de passe.",
        );
      } else {
        toast.success("Mot de passe mis à jour avec succès !");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Email Update */}
      <form onSubmit={handleUpdateEmail}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email
            </CardTitle>
            <CardDescription>
              Modifiez l'adresse email associée à votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button
              type="submit"
              disabled={isUpdatingEmail}
              className="ml-auto"
            >
              {isUpdatingEmail && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Mettre à jour l'email
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Password Update */}
      <form onSubmit={handleUpdatePassword}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Mot de passe
            </CardTitle>
            <CardDescription>
              Changez votre mot de passe pour sécuriser votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  Confirmer le nouveau mot de passe
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button
              type="submit"
              disabled={isUpdatingPassword}
              className="ml-auto"
            >
              {isUpdatingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Changer le mot de passe
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

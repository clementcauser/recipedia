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
import { UserCircle, Loader2 } from "lucide-react";

export function ProfileForm() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [firstName, setFirstName] = useState(session?.user?.firstName || "");
  const [lastName, setLastName] = useState(session?.user?.lastName || "");
  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [image, setImage] = useState(session?.user?.image || "");

  // Update local state when session data arrives
  if (session?.user && firstName === "" && !isSessionLoading) {
    setFirstName(session.user.firstName);
    setLastName(session.user.lastName);
    setDisplayName(session.user.name || "");
    setImage(session.user.image || "");
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await authClient.updateUser({
        firstName,
        lastName,
        name: displayName,
        image,
      });

      if (error) {
        toast.error(
          error.message || "Une erreur est survenue lors de la mise à jour.",
        );
      } else {
        toast.success("Profil mis à jour avec succès !");
      }
    } catch (err) {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsUpdating(false);
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
    <form onSubmit={handleUpdateProfile}>
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Mettez à jour vos informations publiques.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {image ? (
              <img
                src={image}
                alt={displayName || firstName}
                className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <UserCircle className="h-20 w-20 text-muted-foreground" />
            )}
            <div className="flex-1 space-y-1">
              <Label htmlFor="image">URL de l'avatar</Label>
              <Input
                id="image"
                placeholder="https://example.com/avatar.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Votre prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                placeholder="Votre nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Nom d'affichage</Label>
            <Input
              id="displayName"
              placeholder="Comment vous apparaissez"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button
            type="submit"
            disabled={isUpdating}
            className="ml-auto bg-emerald-500 hover:bg-emerald-600"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

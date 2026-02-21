"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de sécurité</CardTitle>
        <CardDescription>
          Gérez les paramètres de sécurité de votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Les options de sécurité avancées sont actuellement en cours de mise à jour.
        </p>
      </CardContent>
    </Card>
  );
}

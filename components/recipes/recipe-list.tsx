"use client";

import { useState } from "react";
import { RecipeCard } from "./recipe-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Utensils, ChefHat } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RecipeListProps {
  initialRecipes: any[];
}

export function RecipeList({ initialRecipes }: RecipeListProps) {
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const filteredRecipes = showOnlyFavorites
    ? initialRecipes.filter((r) => r.isFavorited)
    : initialRecipes;

  if (initialRecipes.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-20 text-center">
        <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle>Aucune recette trouvée</CardTitle>
        <CardDescription>
          Commencez par ajouter votre première recette !
        </CardDescription>
        <Button asChild className="mt-6">
          <Link href="/recipes/new">Ajouter ma première recette</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg border">
        <Checkbox
          id="favorites"
          checked={showOnlyFavorites}
          onCheckedChange={(checked: boolean) => setShowOnlyFavorites(checked)}
        />
        <Label
          htmlFor="favorites"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Afficher uniquement les favoris
        </Label>
      </div>

      {filteredRecipes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed">
          <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle>Aucun favori</CardTitle>
          <CardDescription>
            Vous n'avez pas encore de recettes en favoris.
          </CardDescription>
          {showOnlyFavorites && (
            <Button
              variant="link"
              onClick={() => setShowOnlyFavorites(false)}
              className="mt-2"
            >
              Voir toutes les recettes
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, ChefHat, Star } from "lucide-react";
import Link from "next/link";
import { DeleteRecipeButton } from "@/components/recipes/delete-recipe-button";
import { FavoriteButton } from "@/components/recipes/favorite-button";

interface RecipeCardProps {
  recipe: any; // Using any for brevity here, should ideally use a proper type from prisma
}

const difficultyLabels: Record<string, string> = {
  EASY: "Facile",
  MEDIUM: "Moyen",
  HARD: "Difficile",
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col group relative">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <FavoriteButton
          recipeId={recipe.id}
          initialIsFavorited={recipe.isFavorited}
          className="bg-background/80 backdrop-blur-sm shadow-sm"
        />
      </div>

      {recipe.imageUrl ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <ChefHat className="h-10 w-10 text-muted-foreground" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
          {recipe.difficulty && (
            <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
              {difficultyLabels[recipe.difficulty]}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {recipe.description || "Aucune description"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)}{" "}
              min
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Utensils className="h-3 w-3" />
            <span>{recipe.ingredients?.length || 0} ingr.</span>
          </div>
          {recipe.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-medium">
                {recipe.averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({recipe.reviewCount})
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-muted/5">
        <div className="flex gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href={`/recipes/${recipe.id}`}>Voir</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href={`/recipes/${recipe.id}/edit`}>Modifier</Link>
          </Button>
        </div>
        <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />
      </CardFooter>
    </Card>
  );
}

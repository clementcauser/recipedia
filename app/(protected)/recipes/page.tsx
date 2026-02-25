import { getRecipes } from "@/app/actions/recipe.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Plus, Utensils, Clock, ChefHat } from "lucide-react";
import { DeleteRecipeButton } from "@/components/recipes/delete-recipe-button";
import { Badge } from "@/components/ui/badge";

export default async function RecipesPage() {
  const recipes = await getRecipes();

  const difficultyLabels: Record<string, string> = {
    EASY: "Facile",
    MEDIUM: "Moyen",
    HARD: "Difficile",
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Mes Recettes</h1>
          <p className="text-muted-foreground">
            Gérez votre collection personnelle de recettes.
          </p>
        </div>
        <Button asChild>
          <Link href="/recipes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Recette
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden flex flex-col">
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
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 h-5"
                    >
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
                      {(recipe.prepTimeMinutes || 0) +
                        (recipe.cookTimeMinutes || 0)}{" "}
                      min
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Utensils className="h-3 w-3" />
                    <span>{recipe.ingredients.length} ingr.</span>
                  </div>
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
                <DeleteRecipeButton
                  recipeId={recipe.id}
                  recipeTitle={recipe.title}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

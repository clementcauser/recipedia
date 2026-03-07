import { getRecipes } from "@/app/actions/recipe.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RecipeList } from "@/components/recipes/recipe-list";

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div className="container py-10 px-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Mes Recettes</h1>
          <p className="text-muted-foreground">
            Gérez votre collection personnelle de recettes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/recipes/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Recette
            </Link>
          </Button>
        </div>
      </div>

      <RecipeList initialRecipes={recipes} />
    </div>
  );
}

import { getRecipes } from "@/app/actions/recipe.actions";
import { getBooks } from "@/app/actions/book.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RecipesTabs } from "@/components/recipes/recipes-tabs";

export default async function RecipesPage() {
  const [recipes, books] = await Promise.all([getRecipes(), getBooks()]);

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

      <RecipesTabs initialRecipes={recipes} initialBooks={books} />
    </div>
  );
}

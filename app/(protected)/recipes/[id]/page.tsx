import { getRecipeById } from "@/app/actions/recipe.actions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Edit,
  ScrollText,
  Users,
  ChefHat,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecipePageProps {
  params: {
    id: string;
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipe = await getRecipeById(params.id);

  if (!recipe) {
    notFound();
  }

  const difficultyLabels = {
    EASY: "Facile",
    MEDIUM: "Moyen",
    HARD: "Difficile",
  };

  return (
    <div className="container max-w-4xl py-10">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/recipes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux recettes
        </Link>
      </Button>

      <div className="flex flex-col md:row gap-8 mb-10">
        {recipe.imageUrl && (
          <div className="w-full md:w-1/2 aspect-video overflow-hidden rounded-xl border">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold">{recipe.title}</h1>
              <div className="flex gap-2">
                {recipe.difficulty && (
                  <Badge variant="secondary">
                    {difficultyLabels[recipe.difficulty]}
                  </Badge>
                )}
                {!recipe.isPublic && <Badge variant="outline">Privé</Badge>}
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/recipes/${recipe.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </div>
          {recipe.description && (
            <p className="text-muted-foreground mt-4 mb-6 text-lg italic">
              "{recipe.description}"
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm mt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Préparation: {recipe.prepTimeMinutes || 0} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Cuisson: {recipe.cookTimeMinutes || 0} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Portions: {recipe.servings || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <div className="sticky top-20 border rounded-xl p-6 bg-muted/10">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ScrollText className="mr-2 h-5 w-5" />
              Ingrédients
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients.map((ri: any) => (
                <li
                  key={ri.id}
                  className="flex flex-col border-b pb-2 last:border-0"
                >
                  <div className="flex justify-between font-medium">
                    <span>{ri.ingredient.name}</span>
                    {ri.quantity && (
                      <span className="text-primary">
                        {Number(ri.quantity)} {ri.unit}
                      </span>
                    )}
                  </div>
                  {ri.note && (
                    <span className="text-xs text-muted-foreground italic">
                      ({ri.note})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="md:col-span-2 space-y-8">
          <h2 className="text-xl font-semibold flex items-center">
            <ChefHat className="mr-2 h-5 w-5" />
            Instructions
          </h2>
          <div className="space-y-8">
            {recipe.steps.map((step: any) => (
              <div key={step.id} className="space-y-4">
                <div className="flex gap-4">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    {step.stepNumber}
                  </span>
                  <div className="space-y-4 flex-1">
                    <p className="text-lg leading-relaxed">
                      {step.instruction}
                    </p>
                    {step.imageUrl && (
                      <img
                        src={step.imageUrl}
                        className="rounded-lg border w-full max-h-64 object-cover"
                        alt={`Étape ${step.stepNumber}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

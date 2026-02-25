import { getRecipeById } from "@/app/actions/recipe.actions";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { notFound } from "next/navigation";

interface EditRecipePageProps {
  params: {
    id: string;
  };
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const recipe = await getRecipeById(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Modifier la Recette</h1>
        <p className="text-muted-foreground">
          Mettez à jour les informations de votre recette.
        </p>
      </div>
      <RecipeForm initialData={recipe} />
    </div>
  );
}

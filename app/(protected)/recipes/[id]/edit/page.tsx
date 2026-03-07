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
    <div className="min-h-screen bg-slate-50/50">
      <div className="container max-w-4xl py-20 px-6">
        <div className="mb-12 space-y-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Modifier la Recette
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Mettez à jour les informations de votre recette.
          </p>
        </div>
        <RecipeForm initialData={recipe} />
      </div>
    </div>
  );
}

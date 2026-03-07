import { RecipeForm } from "@/components/recipes/recipe-form";

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container max-w-4xl py-20 px-6">
        <div className="mb-12 space-y-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Nouvelle Recette
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Partagez votre savoir-faire culinaire avec la communauté.
          </p>
        </div>
        <RecipeForm />
      </div>
    </div>
  );
}

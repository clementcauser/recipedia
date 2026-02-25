import { RecipeForm } from "@/components/recipes/recipe-form";

export default function NewRecipePage() {
  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Nouvelle Recette</h1>
        <p className="text-muted-foreground">
          Remplissez le formulaire ci-dessous pour ajouter une nouvelle recette
          manuellement.
        </p>
      </div>
      <RecipeForm />
    </div>
  );
}

import { getRecipeById, getComments } from "@/app/actions/recipe.actions";
import { notFound } from "next/navigation";
import { RecipeContent } from "@/components/recipes/recipe-content";

interface RecipePageProps {
  params: {
    id: string;
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const [recipe, commentsData] = await Promise.all([
    getRecipeById(id),
    getComments(id),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <RecipeContent
      recipe={recipe}
      initialComments={commentsData.comments}
      totalComments={commentsData.totalCount}
    />
  );
}

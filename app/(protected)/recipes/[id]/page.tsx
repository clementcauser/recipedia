import { getRecipeById, getComments } from "@/app/actions/recipe.actions";
import { getBooksWithRecipeStatus } from "@/app/actions/book.actions";
import { notFound } from "next/navigation";
import { RecipeContent } from "@/components/recipes/recipe-content";

interface RecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const [recipe, commentsData, books] = await Promise.all([
    getRecipeById(id),
    getComments(id),
    getBooksWithRecipeStatus(id),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <RecipeContent
      recipe={recipe}
      initialComments={commentsData.comments}
      totalComments={commentsData.totalCount}
      books={books}
    />
  );
}

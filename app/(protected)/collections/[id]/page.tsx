import { getBookById } from "@/app/actions/book.actions";
import { notFound } from "next/navigation";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Utensils } from "lucide-react";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { EditBookDialog } from "@/components/books/edit-book-dialog";
import { DeleteBookDialog } from "@/components/books/delete-book-dialog";

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const resolvedParams = await params;
  const book = await getBookById(resolvedParams.id);

  if (!book) {
    notFound();
  }

  return (
    <div className="container py-10 px-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="pl-0 hover:bg-transparent hover:text-primary"
        >
          <Link href="/recipes?tab=books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mes livres
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-muted-foreground mt-1">
              {book.description || "Aucune description pour ce livre."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <EditBookDialog book={book} />
          <DeleteBookDialog bookId={book.id} bookTitle={book.title} />
        </div>
      </div>

      {book.recipes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed">
          <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Ce livre est vide</CardTitle>
          <CardDescription className="mb-6">
            Ajoutez des recettes à ce livre depuis la page détaillée d'une
            recette.
          </CardDescription>
          <Button asChild>
            <Link href="/recipes">Voir mes recettes</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {book.recipes.map((bookRecipe) => (
            <RecipeCard
              key={bookRecipe.recipe.id}
              recipe={bookRecipe.recipe}
              bookId={book.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

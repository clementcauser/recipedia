"use client";

import { BookCard } from "./book-card";
import { BookOpen } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateBookDialog } from "./create-book-dialog";

interface BookListProps {
  initialBooks: any[];
}

export function BookList({ initialBooks }: BookListProps) {
  if (initialBooks.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle className="mb-2">Aucun livre pour le moment</CardTitle>
        <CardDescription className="mb-6">
          Créez votre première collection pour y ranger vos recettes favorites.
        </CardDescription>
        <CreateBookDialog />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateBookDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

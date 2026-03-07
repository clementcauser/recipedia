"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2, Plus } from "lucide-react";
import { toggleRecipeInBook } from "@/app/actions/book.actions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateBookDialog } from "./create-book-dialog";

interface SaveToBookDialogProps {
  recipeId: string;
  books: {
    id: string;
    title: string;
    isInBook: boolean;
  }[];
}

export function SaveToBookDialog({ recipeId, books }: SaveToBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Keep optimistic state for individual checkboxes to feel snappy
  const [localBooks, setLocalBooks] = useState(books);

  // Sync state if books props change while open
  useState(() => {
    setLocalBooks(books);
  });

  const handleToggle = (bookId: string, currentStatus: boolean) => {
    // Optimistic update
    setLocalBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, isInBook: !currentStatus } : b,
      ),
    );

    startTransition(async () => {
      try {
        await toggleRecipeInBook(bookId, recipeId);
      } catch (error) {
        // Revert on error
        setLocalBooks((prev) =>
          prev.map((b) =>
            b.id === bookId ? { ...b, isInBook: currentStatus } : b,
          ),
        );
        toast.error(
          error instanceof Error ? error.message : "Erreur inattendue",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Enregistrer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enregistrer dans une collection</DialogTitle>
          <DialogDescription>
            Choisissez les livres dans lesquels vous souhaitez ajouter cette
            recette.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {books.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/30">
              Vous n'avez pas encore de livre de recettes.
            </div>
          ) : (
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {localBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center space-x-3 bg-muted/20 p-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`book-${book.id}`}
                      checked={book.isInBook}
                      onCheckedChange={() =>
                        handleToggle(book.id, book.isInBook)
                      }
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={`book-${book.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {book.title}
                    </Label>
                    {isPending && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <CreateBookDialog />
          <Button onClick={() => setOpen(false)}>Terminer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

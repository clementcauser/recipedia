"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookMinus, Loader2 } from "lucide-react";
import { removeRecipeFromBook } from "@/app/actions/book.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RemoveFromBookButtonProps {
  bookId: string;
  recipeId: string;
}

export function RemoveFromBookButton({
  bookId,
  recipeId,
}: RemoveFromBookButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await removeRecipeFromBook(bookId, recipeId);
      toast.success("Recette retirée du livre");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur inattendue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleRemove}
      disabled={isLoading}
      title="Retirer du livre"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <BookMinus className="h-4 w-4" />
      )}
    </Button>
  );
}

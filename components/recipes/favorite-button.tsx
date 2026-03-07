"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/app/actions/recipe.actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  recipeId: string;
  initialIsFavorited: boolean;
  className?: string;
  variant?: "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FavoriteButton({
  recipeId,
  initialIsFavorited,
  className,
  variant = "ghost",
  size = "icon",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const nextState = !isFavorited;
    setIsFavorited(nextState);

    startTransition(async () => {
      try {
        await toggleFavorite(recipeId);
        toast.success(nextState ? "Ajouté aux favoris" : "Retiré des favoris");
      } catch (error) {
        // Rollback on error
        setIsFavorited(!nextState);
        toast.error("Une erreur est survenue");
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "rounded-full transition-all duration-300",
        isFavorited
          ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          : "text-muted-foreground hover:text-red-500",
        className,
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-transform duration-300 active:scale-125",
          isFavorited && "fill-current",
        )}
      />
      <span className="sr-only">
        {isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      </span>
    </Button>
  );
}

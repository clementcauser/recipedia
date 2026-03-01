"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { upsertReview } from "@/app/actions/recipe.actions";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface RecipeReviewProps {
  recipeId: string;
  initialReview?: {
    rating: number;
    comment: string | null;
  } | null;
}

export function RecipeReview({ recipeId, initialReview }: RecipeReviewProps) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialReview?.comment || "");
  const [isSaving, setIsSaving] = useState(false);

  const debouncedComment = useDebounce(comment, 1000);

  const handleRating = async (newRating: number) => {
    setRating(newRating);
    try {
      setIsSaving(true);
      await upsertReview(recipeId, { rating: newRating, comment });
      toast.success("Note enregistrée !");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de la note");
    } finally {
      setIsSaving(false);
    }
  };

  const saveComment = useCallback(async () => {
    if (rating === 0) return;
    if (debouncedComment === initialReview?.comment) return;

    try {
      setIsSaving(true);
      await upsertReview(recipeId, { rating, comment: debouncedComment });
      toast.success("Avis mis à jour !");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du commentaire");
    } finally {
      setIsSaving(false);
    }
  }, [debouncedComment, rating, recipeId, initialReview?.comment]);

  useEffect(() => {
    saveComment();
  }, [saveComment]);

  return (
    <section className="mt-12 pt-12 border-t border-slate-100">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">
            Votre avis
          </h3>
          <p className="text-slate-500 font-medium">
            Qu&apos;avez-vous pensé de cette recette ?
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRating(star)}
              className="p-1 transition-transform active:scale-95"
            >
              <Star
                className={cn(
                  "size-8 transition-all duration-200",
                  (hoverRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400 opacity-100"
                    : "text-slate-200 fill-slate-200 opacity-40 hover:opacity-70",
                )}
              />
            </button>
          ))}
          {isSaving && (
            <span className="text-xs text-slate-400 animate-pulse ml-2 font-medium">
              Enregistrement...
            </span>
          )}
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Ajouter un commentaire (optionnel)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] bg-slate-50 border-none focus-visible:ring-primary/20 placeholder:text-slate-400 font-medium text-slate-700 p-4 rounded-2xl resize-none"
          />
        </div>
      </div>
    </section>
  );
}

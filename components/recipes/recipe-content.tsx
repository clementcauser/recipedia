"use client";

import { BackButton, FloatingHeaderButtons } from "@/components/recipe-buttons";
import { Badge } from "@/components/ui/badge";
import { Prisma } from "@prisma/client";
import {
  Check,
  Clock,
  Dumbbell,
  Flame,
  MessageSquare,
  Minus,
  Plus,
  Star,
  Timer,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { RecipeReview } from "./recipe-review";
import { CommentSection } from "./comment-section";

type Recipe = Omit<
  Prisma.RecipeGetPayload<{
    include: {
      ingredients: {
        include: {
          ingredient: true;
        };
      };
      steps: true;
    };
  }>,
  "ingredients"
> & {
  ingredients: (Omit<
    Prisma.RecipeIngredientGetPayload<{
      include: {
        ingredient: true;
      };
    }>,
    "quantity"
  > & {
    quantity: string | null;
  })[];
  userReview?: {
    rating: number;
    comment: string | null;
  } | null;
  averageRating: number;
  reviewCount: number;
  commentCount: number;
};

interface RecipeContentProps {
  recipe: Recipe;
  initialComments: any[];
  totalComments: number;
}

export function RecipeContent({
  recipe,
  initialComments,
  totalComments,
}: RecipeContentProps) {
  const [servings, setServings] = useState(recipe.servings ?? 1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set(),
  );
  const initialServings = recipe.servings ?? 1;
  const ratio = servings / initialServings;

  const difficultyLabels = {
    EASY: "Facile",
    MEDIUM: "Moyen",
    HARD: "Difficile",
  } as const;

  const incrementServings = () => setServings((prev: number) => prev + 1);
  const decrementServings = () =>
    setServings((prev: number) => Math.max(1, prev - 1));

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="relative h-[45vh] w-full overflow-hidden">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <UtensilsCrossed className="size-20 text-muted-foreground/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-6 left-6 flex items-center gap-4 w-[calc(100%-48px)] justify-between z-10">
          <BackButton href="/recipes" />
          <h1 className="text-white font-bold text-lg">Recipedia</h1>
          <FloatingHeaderButtons />
        </div>

        <div className="absolute bottom-10 left-6 right-6 z-10">
          <h2 className="text-white text-3xl font-extrabold leading-tight mb-2">
            {recipe.title}
          </h2>
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">
                {recipe.averageRating.toFixed(1)}
              </span>
              <span className="text-white/60">({recipe.reviewCount} avis)</span>
            </div>
            <div className="flex items-center gap-1.5 ml-1 pl-4 border-l border-white/20">
              <MessageSquare className="size-4 text-white/80" />
              <span className="font-bold">{recipe.commentCount}</span>
              <span className="text-white/60">commentaires</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex divide-x divide-muted border-b">
        <StatItem
          icon={<UtensilsCrossed className="size-5 text-primary" />}
          label="Portions"
          value={`${servings} personnes`}
        />
        <StatItem
          icon={<Timer className="size-5 text-primary" />}
          label="Temps total"
          value={`${(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} mins`}
        />
        <StatItem
          icon={<Dumbbell className="size-5 text-primary" />}
          label="Difficulté"
          value={
            difficultyLabels[
              (recipe.difficulty as keyof typeof difficultyLabels) || "MEDIUM"
            ]
          }
        />
      </div>

      <div className="px-6 py-8 space-y-12 pb-32">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-slate-800">Ingrédients</h3>
            <div className="flex items-center bg-slate-100 rounded-full p-1 gap-3">
              <button
                onClick={decrementServings}
                className="size-6 flex items-center justify-center text-primary hover:bg-white rounded-full transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <span className="font-bold text-sm text-slate-700 min-w-6 text-center">
                {servings}
              </span>
              <button
                onClick={incrementServings}
                className="size-6 flex items-center justify-center text-primary hover:bg-white rounded-full transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {recipe.ingredients.map((ri: any) => {
              const isChecked = checkedIngredients.has(ri.id);
              return (
                <div
                  key={ri.id}
                  className="flex items-start gap-4 group cursor-pointer"
                  onClick={() => toggleIngredient(ri.id)}
                >
                  <div
                    className={`size-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-1 transition-colors
                    ${isChecked ? "bg-primary border-primary" : "border-slate-200"}`}
                  >
                    {isChecked && (
                      <Check className="size-4 text-white stroke-3" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 pb-2 border-b border-slate-50">
                    <span
                      className={`font-bold transition-all ${isChecked ? "text-slate-400 line-through decoration-2" : "text-slate-700"}`}
                    >
                      {ri.ingredient.name}
                    </span>
                    <span
                      className={`text-sm ${isChecked ? "text-slate-300" : "text-slate-400"}`}
                    >
                      {ri.quantity
                        ? Number(
                            (Number(ri.quantity) * ratio).toFixed(2),
                          ).toString()
                        : "1"}{" "}
                      {ri.unit}
                      {ri.note && `, ${ri.note}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-black text-slate-800 mb-8">
            Instructions
          </h3>
          <div className="space-y-10">
            {recipe.steps.map((step: any, index: number) => (
              <div key={step.id} className="flex gap-6">
                <div
                  className={`size-10 rounded-full flex items-center justify-center shrink-0 font-bold text-lg
                  ${
                    index === 0
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : index === 1
                        ? "bg-recipe-green-light text-primary"
                        : "bg-recipe-green-light/50 text-recipe-green-dark"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="space-y-3 pt-1">
                  <h4 className="font-black text-xl text-slate-800 tracking-tight">
                    Étape {index + 1}
                  </h4>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {step.instruction}
                  </p>

                  {step.imageUrl && (
                    <img
                      src={step.imageUrl}
                      alt={`Étape ${index + 1}`}
                      className="w-full h-48 object-cover rounded-2xl shadow-sm border border-slate-100"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        {recipe.isPublic && (
          <RecipeReview
            recipeId={recipe.id}
            initialReview={recipe.userReview}
          />
        )}
        <CommentSection
          recipeId={recipe.id}
          comments={initialComments}
          totalCount={totalComments}
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex-1 py-6 flex flex-col items-center gap-1 bg-white">
      {icon}
      <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">
        {label}
      </span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    description: string | null;
    _count: { recipes: number };
    recipes: { recipe: { imageUrl: string | null } }[];
  };
}

export function BookCard({ book }: BookCardProps) {
  // Try to find a cover image from one of the recipes
  const coverImage = book.recipes.find((r) => r.recipe.imageUrl)?.recipe
    .imageUrl;

  return (
    <Link href={`/collections/${book.id}`} className="block group">
      <div className="bg-white rounded-3xl p-4 border shadow-sm hover:shadow-md transition-all h-full flex flex-col cursor-pointer">
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-muted flex items-center justify-center">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
          )}

          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            {book._count.recipes}{" "}
            {book._count.recipes > 1 ? "recettes" : "recette"}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight line-clamp-1 mb-1">
            {book.title}
          </h3>
          <p className="text-sm font-medium text-slate-500 line-clamp-2">
            {book.description || "Aucune description"}
          </p>
        </div>
      </div>
    </Link>
  );
}

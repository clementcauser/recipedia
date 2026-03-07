"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RecipeList } from "./recipe-list";
import { BookList } from "@/components/books/book-list";

interface RecipesTabsProps {
  initialRecipes: any[];
  initialBooks: any[];
}

export function RecipesTabs({
  initialRecipes,
  initialBooks,
}: RecipesTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"recipes" | "books">(
    tab === "books" ? "books" : "recipes",
  );

  useEffect(() => {
    if (tab === "books" || tab === "recipes") {
      setActiveTab(tab as "recipes" | "books");
    }
  }, [tab]);

  const handleTabChange = (newTab: "recipes" | "books") => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border">
        <button
          onClick={() => handleTabChange("recipes")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "recipes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Mes Recettes
        </button>
        <button
          onClick={() => handleTabChange("books")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "books"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Mes Livres
        </button>
      </div>

      <div className="pt-2">
        {activeTab === "recipes" ? (
          <RecipeList initialRecipes={initialRecipes} />
        ) : (
          <BookList initialBooks={initialBooks} />
        )}
      </div>
    </div>
  );
}

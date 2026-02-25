import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRecipes } from "./actions/recipe.actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickImportCard } from "@/components/dashboard/quick-import-card";
import { RecipeCardHorizontal } from "@/components/dashboard/recipe-card-horizontal";
import { CommunityPickCard } from "@/components/dashboard/community-pick-card";
import { Soup, BookOpen, TrendingUp, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 text-center bg-zinc-50 dark:bg-zinc-950">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Bienvenue sur <span className="text-emerald-500">Recipedia</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Organisez vos recettes, importez-les depuis le web et rejoignez une
          communauté de passionnés de cuisine.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    );
  }

  const recipes = await getRecipes();
  const recentRecipes = recipes.slice(0, 3);

  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = "Bonjour";
  if (hour >= 18) greeting = "Bonsoir";
  if (hour >= 5 && hour < 12) greeting = "Bon matin";

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-20 md:pb-10">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              {greeting},
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Chef {session.user.firstName}
            </h1>
          </div>
          {/* <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm"> */}
          <Avatar size="lg">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback>
              <UserCircle className="h-full w-full text-zinc-300 dark:text-zinc-700" />
            </AvatarFallback>
          </Avatar>
          {/* </div> */}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section>
              <QuickImportCard />
            </section>

            {/* Stats (Inline for Mobile, Grid for Desktop) */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                label="Recettes cuisinées"
                value={recipes.length}
                icon={Soup}
                iconColor="text-emerald-500"
                bgColor="bg-emerald-50 dark:bg-emerald-950/20"
              />
              <StatCard
                label="Livres créés"
                value="3"
                icon={BookOpen}
                iconColor="text-blue-500"
                bgColor="bg-blue-50 dark:bg-blue-950/20"
              />
              <StatCard
                label="Préférées"
                value="12"
                icon={TrendingUp}
                iconColor="text-purple-500"
                bgColor="bg-purple-50 dark:bg-purple-950/20"
              />
            </section>

            {/* Recently Added */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight">
                  Ajouts récents
                </h2>
                <Link
                  href="/recipes"
                  className="text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  Voir tout
                </Link>
              </div>
              <div className="space-y-4">
                {recipes.length > 0 ? (
                  recipes
                    .slice(0, 3)
                    .map((recipe) => (
                      <RecipeCardHorizontal
                        key={recipe.id}
                        id={recipe.id}
                        title={recipe.title}
                        category={
                          recipe.categories[0]?.category.name || "Général"
                        }
                        time={`${(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} min`}
                        calories="320 kcal"
                        image={recipe.imageUrl || undefined}
                        isLiked={recipe.favorites.length > 0}
                      />
                    ))
                ) : (
                  <div className="p-8 text-center border-2 border-dashed rounded-2xl text-muted-foreground">
                    Aucune recette pour le moment.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Side Content (Right on Desktop) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Community Picks */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight">
                  Coups de cœur
                </h2>
                <Link
                  href="/community"
                  className="text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  Explorer
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                <CommunityPickCard
                  id="1"
                  title="Curry Vert Thaï"
                  author="ChefAnna"
                  rating={4.9}
                  image="https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80"
                />
                <CommunityPickCard
                  id="2"
                  title="Pancakes aux Myrtilles"
                  author="MorningJoe"
                  rating={4.7}
                  image="https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=800&q=80"
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

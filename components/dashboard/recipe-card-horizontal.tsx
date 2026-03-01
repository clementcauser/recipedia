import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecipeCardHorizontalProps {
  id: string;
  title: string;
  category: string;
  image?: string;
  time?: string;
  calories?: string;
  isLiked?: boolean;
  rating?: number;
  reviewCount?: number;
}

export function RecipeCardHorizontal({
  id,
  title,
  category,
  image,
  time,
  calories,
  isLiked,
  rating,
  reviewCount,
}: RecipeCardHorizontalProps) {
  return (
    <Link href={`/recipes/${id}`} className="group block">
      <div className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
        <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0">
          <Image
            src={image || "/placeholder-recipe.jpg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <button className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-white dark:hover:bg-black">
            <Heart
              className={cn(
                "h-3.5 w-3.5",
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-zinc-600 dark:text-zinc-300",
              )}
            />
          </button>
        </div>

        <div className="flex-1 min-w-0 py-1">
          <Badge
            variant="secondary"
            className="mb-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-none"
          >
            {category}
          </Badge>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate mb-1 leading-tight">
            {title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            {time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {time}
              </span>
            )}
            {calories && (
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3" />
                {calories}
              </span>
            )}
            {rating !== undefined && rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="h-3 w-3 fill-current" />
                {rating.toFixed(1)}
                {reviewCount !== undefined && (
                  <span className="text-muted-foreground ml-0.5">
                    ({reviewCount})
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

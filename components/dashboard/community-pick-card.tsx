import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

interface CommunityPickCardProps {
  id: string;
  title: string;
  author: string;
  image?: string;
  rating: number;
}

export function CommunityPickCard({
  id,
  title,
  author,
  image,
  rating,
}: CommunityPickCardProps) {
  return (
    <Link href={`/recipes/${id}`} className="group block">
      <div className="relative aspect-4/3 rounded-3xl overflow-hidden mb-3">
        <Image
          src={image || "/placeholder-recipe.jpg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-white border border-white/20">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {rating.toFixed(1)}
        </div>
      </div>
      <div className="px-1">
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight mb-0.5">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground font-medium italic">
          Par @{author}
        </p>
      </div>
    </Link>
  );
}

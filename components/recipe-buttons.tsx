"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  Edit2,
  MessageSquare,
  MoreHorizontal,
  Share2,
  Star,
} from "lucide-react";
import Link from "next/link";

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ActionButton({ icon, onClick, className }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        "size-14 rounded-2xl border-border bg-white text-muted-foreground hover:bg-accent transition-all active:scale-95",
        className,
      )}
    >
      {icon}
    </Button>
  );
}

export function BackButton({ href }: { href: string }) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
    >
      <Link href={href}>
        <ChevronLeft className="size-6" />
      </Link>
    </Button>
  );
}

interface FloatingHeaderButtonsProps {
  onShare?: () => void;
  onEdit?: () => void;
  onRate?: () => void;
  onComment?: () => void;
  isAuthor?: boolean;
}

export function FloatingHeaderButtons({
  onShare,
  onEdit,
  onRate,
  onComment,
  isAuthor,
}: FloatingHeaderButtonsProps) {
  return (
    <div className="flex gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
        onClick={onShare}
      >
        <Share2 className="size-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="w-56 rounded-2xl p-2 border-none shadow-xl"
        >
          {isAuthor && (
            <DropdownMenuItem
              onClick={onEdit}
              className="rounded-xl py-3 font-bold text-slate-700 focus:bg-primary/10 focus:text-primary cursor-pointer"
            >
              <Edit2 className="mr-3 size-4" />
              Modifier la recette
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={onRate}
            className="rounded-xl py-3 font-bold text-slate-700 focus:bg-primary/10 focus:text-primary cursor-pointer"
          >
            <Star className="mr-3 size-4" />
            Donner une note
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onComment}
            className="rounded-xl py-3 font-bold text-slate-700 focus:bg-primary/10 focus:text-primary cursor-pointer"
          >
            <MessageSquare className="mr-3 size-4" />
            Commenter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

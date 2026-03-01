"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, MoreHorizontal, Share2 } from "lucide-react";
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
  onMore?: () => void;
}

export function FloatingHeaderButtons({
  onShare,
  onMore,
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
      <Button
        variant="ghost"
        size="icon"
        className="size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
        onClick={onMore}
      >
        <MoreHorizontal className="size-5" />
      </Button>
    </div>
  );
}

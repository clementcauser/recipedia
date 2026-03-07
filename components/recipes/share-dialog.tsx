"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, Facebook, Share2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
  recipeUrl: string;
}

export function ShareDialog({
  isOpen,
  onClose,
  recipeTitle,
  recipeUrl,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl);
      setCopied(true);
      toast.success("Lien copié dans le presse-papiers !");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Échec de la copie du lien");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipeTitle,
          text: `Découvrez cette délicieuse recette sur Recipedia : ${recipeTitle}`,
          url: recipeUrl,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    }
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="size-5" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`,
      color: "bg-[#1877F2] hover:bg-[#1877F2]/90",
    },
    {
      name: "X (Twitter)",
      icon: <X className="size-5" />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez cette recette sur Recipedia : ${recipeTitle}`)}&url=${encodeURIComponent(recipeUrl)}`,
      color: "bg-[#000000] hover:bg-[#000000]/90",
    },
    {
      name: "Instagram",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      href: "#", // Instagram requires native app or stories sharing via specific APIs/intents which are limited on web
      color:
        "bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        toast.info(
          "Sur Instagram, partagez le lien dans votre bio ou vos stories !",
        );
        handleCopyLink();
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800">
            Partager la recette
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Partagez "{recipeTitle}" avec vos amis et votre famille.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.name !== "Instagram" ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={link.onClick}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`size-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 group-hover:-translate-y-1 ${link.color}`}
                >
                  {link.icon}
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">
                  {link.name}
                </span>
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {typeof navigator !== "undefined" && !!navigator?.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-200"
              >
                <Share2 className="size-5 mr-2" />
                Partager
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Copy className="size-4 text-slate-400 font-bold" />
              </div>
              <input
                type="text"
                readOnly
                value={recipeUrl}
                className="w-full h-12 pl-11 pr-24 rounded-2xl bg-slate-50 border-none font-medium text-slate-600 text-sm focus:ring-2 focus:ring-primary/20"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="absolute right-1.5 top-1.5 h-9 rounded-xl px-4 font-bold"
              >
                {copied ? <Check className="size-4" /> : "Copier"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

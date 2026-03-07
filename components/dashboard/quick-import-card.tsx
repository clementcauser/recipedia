"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkIcon, Download } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function QuickImportCard() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleImport = () => {
    if (!url.trim()) return;
    router.push(`/recipes/new?importUrl=${encodeURIComponent(url.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleImport();
    }
  };

  return (
    <Card className="border-none shadow-md bg-linear-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Import Rapide</CardTitle>
        <CardDescription>
          Collez une URL pour sauvegarder une recette instantanément.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-primary"
          />
        </div>
        <Button
          onClick={handleImport}
          disabled={!url.trim()}
          className="w-full h-12 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="h-5 w-5" />
          Importer la recette
        </Button>
      </CardContent>
    </Card>
  );
}

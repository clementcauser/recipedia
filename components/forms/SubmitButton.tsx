// components/forms/SubmitButton.tsx
"use client";

// useFormStatus donne accès à l'état du <form> parent
// sans avoir à passer de props ou utiliser un state externe
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export function SubmitButton({
  label = "Enregistrer",
  loadingLabel = "Enregistrement...",
  className = "",
}: SubmitButtonProps) {
  // ✅ useFormStatus détecte automatiquement le <form> parent
  // "pending" est true pendant que la Server Action s'exécute
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
        bg-indigo-600 text-white hover:bg-indigo-700
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? loadingLabel : label}
    </button>
  );
}

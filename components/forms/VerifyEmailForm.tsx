"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  resendVerificationEmail,
  verifyEmail,
} from "@/features/auth/auth.actions";

export function VerifyEmailForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmit = async (code: string) => {
    if (code.length !== 6) return;

    startTransition(async () => {
      const result = await verifyEmail({ code });

      if (!result.success) {
        toast.error(result.error);
        setValue("");
        return;
      }

      toast.success(result.message);
      router.push("/dashboard");
      router.refresh();
    });
  };

  const handleResend = async () => {
    setIsResending(true);

    const result = await resendVerificationEmail({ code: value });

    setIsResending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message);
    setValue("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            // Auto-submit quand les 6 chiffres sont entrés
            if (newValue.length === 6) {
              handleSubmit(newValue);
            }
          }}
          disabled={isPending}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Vérification en cours...
        </div>
      )}

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={handleResend}
          disabled={isResending || isPending}
          className="text-sm"
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Renvoyer le code"
          )}
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Astuce :</strong> Vous pouvez coller directement le code à
          6 chiffres depuis votre email
        </p>
      </div>
    </div>
  );
}

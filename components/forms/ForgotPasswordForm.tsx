"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ForgotPasswordFormData,
  ForgotPasswordSchema,
} from "@/features/auth/auth.schema";
import { forgotPassword } from "@/features/auth/auth.actions";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      const result = await forgotPassword(data);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      setEmailSent(true);
    });
  };

  if (emailSent) {
    return (
      <div className="space-y-6">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Si un compte existe avec l&apos;adresse{" "}
            <strong>{form.getValues("email")}</strong>, vous recevrez un email
            avec un lien de réinitialisation dans quelques minutes.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Vérifiez également vos spams si vous ne recevez rien.
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            Renvoyer l&apos;email
          </Button>

          <Button type="button" variant="ghost" className="w-full" asChild>
            <a href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Nous vous enverrons un lien pour réinitialiser votre mot de
                passe
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="gap-2 flex flex-col">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer le lien
              </>
            )}
          </Button>

          <Button type="button" variant="ghost" className="w-full" asChild>
            <a href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </a>
          </Button>
        </div>
      </form>
    </Form>
  );
}

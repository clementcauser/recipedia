import { z } from "zod";

// ── Validation email réutilisable ─────────────────────────
const emailSchema = z
  .email("Format d'email invalide")
  .min(1, "L'email est requis")
  .toLowerCase()
  .trim();

// ── Validation mot de passe réutilisable ──────────────────
const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(100, "Le mot de passe est trop long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
  );

// ── INSCRIPTION ───────────────────────────────────────────
export const SignupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom est trop long")
      .trim(),
    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom est trop long")
      .trim(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof SignupSchema>;

// ── CONNEXION ─────────────────────────────────────────────
export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

// ── MOT DE PASSE OUBLIÉ ───────────────────────────────────
export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

// ── RÉINITIALISATION MOT DE PASSE ─────────────────────────
export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token invalide"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

// ── CHANGEMENT DE MOT DE PASSE (utilisateur connecté) ────
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

// ── MISE À JOUR PROFIL ────────────────────────────────────
export const UpdateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50)
    .trim(),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50)
    .trim(),
  email: emailSchema,
  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, "Numéro de téléphone français invalide")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(500, "La biographie ne peut pas dépasser 500 caractères")
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

// ── VÉRIFICATION EMAIL (code OTP) ─────────────────────────
export const VerifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Le code doit contenir uniquement des chiffres"),
});

export type VerifyEmailFormData = z.infer<typeof VerifyEmailSchema>;

// ── AUTHENTIFICATION 2FA ──────────────────────────────────
export const TwoFactorSchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Code invalide"),
});

// Schéma étendu pour inclure le tempToken
export const VerifyTwoFactorSchema = TwoFactorSchema.extend({
  tempToken: z.string().min(1, "Token temporaire manquant"),
});

export type TwoFactorFormData = z.infer<typeof TwoFactorSchema>;

// ── ACTIVATION/DÉSACTIVATION 2FA ──────────────────────────
export const Toggle2FASchema = z.object({
  enabled: z.boolean(),
  password: z.string().min(1, "Mot de passe requis pour cette action"),
});

export type Toggle2FAFormData = z.infer<typeof Toggle2FASchema>;

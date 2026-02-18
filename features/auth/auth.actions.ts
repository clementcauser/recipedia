"use server";

// ─────────────────────────────────────────────────────────
// Server Actions pour l'authentification
// Utilise l'utilitaire générique createAction() pour zéro duplication
// ─────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { createAction, apiFetch } from "@/lib/action-handler";
import { cookies } from "next/headers";
import {
  SignupSchema,
  SignupFormData,
  LoginSchema,
  LoginFormData,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  VerifyEmailSchema,
  UpdateProfileSchema,
  Toggle2FASchema,
  VerifyTwoFactorSchema,
} from "./auth.schema";
import {
  SessionUser,
  createSession,
  setSessionCookie,
  getCurrentUser,
  deleteSessionCookie,
  requireAuth,
} from "./session";

// ─────────────────────────────────────────────────────────
// 1. INSCRIPTION
// ─────────────────────────────────────────────────────────
export const signup = createAction({
  schema: SignupSchema,

  handler: async (data: SignupFormData) => {
    // Appel API pour créer le compte
    const response = await apiFetch<{
      user: SessionUser;
      requiresEmailVerification: boolean;
    }>({
      endpoint: "/auth/signup",
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Si pas de vérification email requise, créer la session immédiatement
    if (!response.requiresEmailVerification) {
      const sessionToken = await createSession(response.user);
      await setSessionCookie(sessionToken);
    }

    return {
      userId: response.user.id,
      requiresEmailVerification: response.requiresEmailVerification,
    };
  },

  successMessage: (data) =>
    data.requiresEmailVerification
      ? "Compte créé ! Vérifiez votre email pour activer votre compte."
      : "Compte créé avec succès !",

  errorTransform: (error) => {
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        return "Un compte existe déjà avec cet email";
      }
      if (error.message.includes("422")) {
        return "Données invalides";
      }
    }
    return "Erreur lors de la création du compte";
  },
});

// ─────────────────────────────────────────────────────────
// 2. CONNEXION
// ─────────────────────────────────────────────────────────
export const login = createAction({
  schema: LoginSchema,

  handler: async (data: LoginFormData) => {
    const response = await apiFetch<{
      user: SessionUser;
      requiresTwoFactor: boolean;
      tempToken?: string;
    }>({
      endpoint: "/auth/login",
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
      },
    });

    // Si 2FA activé, ne pas créer la session tout de suite
    if (response.requiresTwoFactor) {
      return {
        requiresTwoFactor: true,
        tempToken: response.tempToken,
      };
    }

    // Créer la session
    const sessionToken = await createSession(response.user);
    await setSessionCookie(sessionToken);

    return {
      requiresTwoFactor: false,
      userId: response.user.id,
    };
  },

  successMessage: "Connexion réussie !",

  errorTransform: (error) => {
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return "Email ou mot de passe incorrect";
      }
      if (error.message.includes("403")) {
        return "Compte désactivé. Contactez le support.";
      }
    }
    return "Erreur lors de la connexion";
  },
});

// ─────────────────────────────────────────────────────────
// 3. VÉRIFICATION 2FA (après login)
// ─────────────────────────────────────────────────────────
export const verifyTwoFactor = createAction({
  schema: VerifyTwoFactorSchema,
  handler: async (data: { code: string; tempToken: string }) => {
    const response = await apiFetch<{ user: SessionUser }>({
      endpoint: "/auth/verify-2fa",
      method: "POST",
      body: {
        code: data.code,
        tempToken: data.tempToken,
      },
    });

    // Créer la session après vérification 2FA réussie
    const sessionToken = await createSession(response.user);
    await setSessionCookie(sessionToken);

    return { userId: response.user.id };
  },

  successMessage: "Connexion réussie !",

  errorTransform: (error) => {
    if (error instanceof Error && error.message.includes("401")) {
      return "Code incorrect ou expiré";
    }
    return "Erreur lors de la vérification";
  },
});

// ─────────────────────────────────────────────────────────
// 4. DÉCONNEXION
// ─────────────────────────────────────────────────────────
export async function logout() {
  const user = await getCurrentUser();

  // Appel API optionnel pour invalider le refresh token côté serveur
  if (user) {
    await apiFetch({
      endpoint: "/auth/logout",
      method: "POST",
    }).catch(() => {
      // Ignorer les erreurs - on supprime la session locale de toute façon
    });
  }

  // Supprimer le cookie de session
  await deleteSessionCookie();

  return { success: true, message: "Déconnexion réussie" };
}

// Wrapper avec redirect automatique
export async function logoutAndRedirect() {
  await logout();
  redirect("/login");
}

// ─────────────────────────────────────────────────────────
// 5. MOT DE PASSE OUBLIÉ
// ─────────────────────────────────────────────────────────
export const forgotPassword = createAction({
  schema: ForgotPasswordSchema,

  handler: async (data) => {
    await apiFetch({
      endpoint: "/auth/forgot-password",
      method: "POST",
      body: { email: data.email },
    });

    // Pour la sécurité, on retourne toujours success même si l'email n'existe pas
    return { sent: true };
  },

  successMessage:
    "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
});

// ─────────────────────────────────────────────────────────
// 6. RÉINITIALISATION MOT DE PASSE
// ─────────────────────────────────────────────────────────
export const resetPassword = createAction({
  schema: ResetPasswordSchema,

  handler: async (data) => {
    await apiFetch({
      endpoint: "/auth/reset-password",
      method: "POST",
      body: {
        token: data.token,
        password: data.password,
      },
    });

    return { success: true };
  },

  successMessage: "Mot de passe réinitialisé avec succès !",

  errorTransform: (error) => {
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return "Lien expiré ou invalide. Demandez un nouveau lien.";
      }
    }
    return "Erreur lors de la réinitialisation";
  },
});

// ─────────────────────────────────────────────────────────
// 7. CHANGEMENT DE MOT DE PASSE (utilisateur connecté)
// ─────────────────────────────────────────────────────────
export const changePassword = createAction({
  schema: ChangePasswordSchema,

  handler: async (data) => {
    // Vérifier que l'utilisateur est connecté
    const user = await requireAuth();

    await apiFetch({
      endpoint: "/auth/change-password",
      method: "POST",
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    });

    return { userId: user.id };
  },

  successMessage: "Mot de passe modifié avec succès !",

  errorTransform: (error) => {
    if (error instanceof Error && error.message.includes("401")) {
      return "Mot de passe actuel incorrect";
    }
    return "Erreur lors du changement de mot de passe";
  },
});

// ─────────────────────────────────────────────────────────
// 8. VÉRIFICATION EMAIL (code OTP)
// ─────────────────────────────────────────────────────────
export const verifyEmail = createAction({
  schema: VerifyEmailSchema,

  handler: async (data) => {
    const user = await requireAuth();

    const response = await apiFetch<{ user: SessionUser }>({
      endpoint: "/auth/verify-email",
      method: "POST",
      body: { code: data.code },
    });

    // Mettre à jour la session avec le statut emailVerified
    const sessionToken = await createSession(response.user);
    await setSessionCookie(sessionToken);

    return { userId: user.id };
  },

  successMessage: "Email vérifié avec succès !",

  errorTransform: (error) => {
    if (error instanceof Error && error.message.includes("401")) {
      return "Code incorrect ou expiré";
    }
    return "Erreur lors de la vérification";
  },
});

// ─────────────────────────────────────────────────────────
// 9. RENVOYER LE CODE DE VÉRIFICATION EMAIL
// ─────────────────────────────────────────────────────────
export const resendVerificationEmail = createAction({
  handler: async () => {
    const user = await requireAuth();

    if (user.emailVerified) {
      throw new Error("Email déjà vérifié");
    }

    await apiFetch({
      endpoint: "/auth/resend-verification",
      method: "POST",
    });

    return { sent: true };
  },

  successMessage: "Code de vérification renvoyé !",
});

// ─────────────────────────────────────────────────────────
// 10. MISE À JOUR PROFIL
// ─────────────────────────────────────────────────────────
export const updateProfile = createAction({
  schema: UpdateProfileSchema,

  handler: async (data) => {
    const user = await requireAuth();

    const response = await apiFetch<{ user: SessionUser }>({
      endpoint: "/users/profile",
      method: "PATCH",
      body: data,
    });

    // Mettre à jour la session avec les nouvelles données
    const sessionToken = await createSession(response.user);
    await setSessionCookie(sessionToken);

    return { userId: user.id };
  },

  revalidate: {
    paths: ["/profile"],
  },

  successMessage: "Profil mis à jour avec succès !",

  errorTransform: (error) => {
    if (error instanceof Error && error.message.includes("409")) {
      return "Cet email est déjà utilisé par un autre compte";
    }
    return "Erreur lors de la mise à jour du profil";
  },
});

// ─────────────────────────────────────────────────────────
// 11. ACTIVER/DÉSACTIVER 2FA
// ─────────────────────────────────────────────────────────
export const toggle2FA = createAction({
  schema: Toggle2FASchema,

  handler: async (data) => {
    const user = await requireAuth();

    const response = await apiFetch<{
      enabled: boolean;
      qrCode?: string; // Pour setup initial
      backupCodes?: string[]; // Codes de secours
    }>({
      endpoint: "/auth/2fa/toggle",
      method: "POST",
      body: {
        enabled: data.enabled,
        password: data.password,
      },
    });

    // Mettre à jour la session
    const updatedUser = { ...user, twoFactorEnabled: response.enabled };
    const sessionToken = await createSession(updatedUser);
    await setSessionCookie(sessionToken);

    return response;
  },

  successMessage: (data) =>
    data.enabled
      ? "Authentification à deux facteurs activée !"
      : "Authentification à deux facteurs désactivée",

  errorTransform: (error) => {
    if (error instanceof Error && error.message.includes("401")) {
      return "Mot de passe incorrect";
    }
    return "Erreur lors de la modification de la 2FA";
  },
});

// ─────────────────────────────────────────────────────────
// 12. SUPPRIMER LE COMPTE
// ─────────────────────────────────────────────────────────
export const deleteAccount = createAction({
  handler: async (data: { password: string }) => {
    const user = await requireAuth();

    await apiFetch({
      endpoint: "/users/account",
      method: "DELETE",
      body: { password: data.password },
    });

    // Supprimer la session
    await deleteSessionCookie();

    return { deletedUserId: user.id };
  },

  successMessage: "Compte supprimé définitivement",

  errorTransform: (error) => {
    if (error instanceof Error && error.message.includes("401")) {
      return "Mot de passe incorrect";
    }
    return "Erreur lors de la suppression du compte";
  },
});

// Wrapper avec redirect
export async function deleteAccountAndRedirect(password: string) {
  const result = await deleteAccount({ password });

  if (result.success) {
    redirect("/");
  }

  return result;
}

// ─────────────────────────────────────────────────────────
// 13. RÉCUPÉRER L'UTILISATEUR COURANT (helper pour client)
// ─────────────────────────────────────────────────────────
export async function getMe() {
  return getCurrentUser();
}

// ─────────────────────────────────────────────────────────
// 14. OAUTH - Démarrer le flow (Google, GitHub, etc.)
// ─────────────────────────────────────────────────────────
export async function initiateOAuth(
  provider: "google" | "github" | "microsoft",
) {
  // Générer l'URL OAuth avec state/nonce pour sécurité
  const state = crypto.randomUUID();
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/${provider}`;

  // Stocker le state dans un cookie temporaire (anti-CSRF)
  const cookieStore = await cookies();
  cookieStore.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const authUrl = await apiFetch<{ url: string }>({
    endpoint: `/auth/oauth/${provider}/authorize`,
    method: "POST",
    body: { state, redirectUri },
  });

  redirect(authUrl.url);
}

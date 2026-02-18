// lib/action-handler.ts
// ─────────────────────────────────────────────────────────
// Utilitaire générique pour éliminer la duplication dans les Server Actions
// ─────────────────────────────────────────────────────────

import { revalidatePath, revalidateTag } from "next/cache";
import type { ZodSchema } from "zod";

// ── Types génériques ──────────────────────────────────────
export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

interface ActionConfig<TInput, TOutput> {
  // Schéma Zod pour la validation
  schema?: ZodSchema<TInput>;

  // La fonction principale qui exécute la logique métier
  handler: (validatedData: TInput) => Promise<TOutput>;

  // Chemins/tags à revalider après succès
  revalidate?: {
    paths?: string[];
    tags?: string[];
  };

  // Message de succès personnalisé
  successMessage?: string | ((data: TOutput) => string);

  // Transformation des erreurs API
  errorTransform?: (error: unknown) => string;
}

// ── Handler générique ─────────────────────────────────────
export function createAction<TInput, TOutput = void>(
  config: ActionConfig<TInput, TOutput>,
) {
  return async (data: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Validation optionnelle avec Zod
      let validatedData = data;

      if (config.schema) {
        const parsed = config.schema.safeParse(data);

        if (!parsed.success) {
          const fieldErrors = Object.fromEntries(
            Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
              k,
              (Array.isArray(v) && v[0]) ?? "Erreur de validation",
            ]),
          );

          return {
            success: false,
            error: "Données invalides",
            fieldErrors,
          };
        }

        validatedData = parsed.data;
      }

      // 2. Exécution du handler métier
      const result = await config.handler(validatedData);

      // 3. Revalidation du cache Next.js
      if (config.revalidate?.paths) {
        config.revalidate.paths.forEach((path) => revalidatePath(path));
      }

      if (config.revalidate?.tags) {
        config.revalidate.tags.forEach((tag) => revalidateTag(tag, "max"));
      }

      // 4. Message de succès
      const message =
        typeof config.successMessage === "function"
          ? config.successMessage(result)
          : config.successMessage;

      return {
        success: true,
        data: result,
        message,
      };
    } catch (error) {
      console.error("[Action Error]", error);

      const errorMessage = config.errorTransform
        ? config.errorTransform(error)
        : error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue";

      return {
        success: false,
        error: errorMessage,
      };
    }
  };
}

// ── Helper pour les appels API REST ──────────────────────
interface ApiFetchConfig {
  endpoint: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(config: ApiFetchConfig): Promise<T> {
  const response = await fetch(
    `${process.env.API_BASE_URL}${config.endpoint}`,
    {
      method: config.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message ??
        `Erreur API: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

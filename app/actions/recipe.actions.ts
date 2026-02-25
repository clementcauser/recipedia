"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import slugify from "slugify";

const ingredientSchema = z.object({
  name: z.string().min(1, "Nom de l'ingrédient requis"),
  quantity: z.coerce.number().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
});

const stepSchema = z.object({
  instruction: z.string().min(1, "L'instruction est requise"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  prepTimeMinutes: z.coerce.number().int().nonnegative().optional(),
  cookTimeMinutes: z.coerce.number().int().nonnegative().optional(),
  servings: z.coerce.number().int().positive().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  isPublic: z.boolean().default(true),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "Au moins un ingrédient est requis"),
  steps: z.array(stepSchema).min(1, "Au moins une étape est requise"),
});

export type RecipeInput = z.infer<typeof recipeSchema>;

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

function generateSlug(title: string) {
  return `${slugify(title, { lower: true, strict: true })}-${Math.random().toString(36).substring(2, 7)}`;
}

export async function createRecipe(data: RecipeInput) {
  const session = await getSession();
  if (!session) {
    throw new Error("Vous devez être connecté pour créer une recette");
  }

  const validatedData = recipeSchema.parse(data);
  const slug = generateSlug(validatedData.title);

  const recipe = await db.recipe.create({
    data: {
      title: validatedData.title,
      slug,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl,
      prepTimeMinutes: validatedData.prepTimeMinutes,
      cookTimeMinutes: validatedData.cookTimeMinutes,
      servings: validatedData.servings,
      difficulty: validatedData.difficulty,
      isPublic: validatedData.isPublic,
      userId: session.user.id,
      steps: {
        create: validatedData.steps.map((step, index) => ({
          stepNumber: index + 1,
          instruction: step.instruction,
          imageUrl: step.imageUrl,
        })),
      },
      ingredients: {
        create: await Promise.all(
          validatedData.ingredients.map(async (ing, index) => {
            const ingredient = await db.ingredient.upsert({
              where: { name: ing.name.toLowerCase() },
              update: {},
              create: { name: ing.name.toLowerCase() },
            });

            return {
              ingredientId: ingredient.id,
              quantity: ing.quantity,
              unit: ing.unit,
              note: ing.note,
              position: index + 1,
            };
          }),
        ),
      },
    },
  });

  revalidatePath("/recipes");
  return recipe;
}

export async function updateRecipe(id: string, data: RecipeInput) {
  const session = await getSession();
  if (!session) {
    throw new Error("Vous devez être connecté pour modifier une recette");
  }

  const validatedData = recipeSchema.parse(data);

  await db.$transaction(async (tx) => {
    const existing = await tx.recipe.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) throw new Error("Recette non trouvée");

    await tx.recipeStep.deleteMany({ where: { recipeId: id } });
    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });

    await tx.recipe.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        prepTimeMinutes: validatedData.prepTimeMinutes,
        cookTimeMinutes: validatedData.cookTimeMinutes,
        servings: validatedData.servings,
        difficulty: validatedData.difficulty,
        isPublic: validatedData.isPublic,
        steps: {
          create: validatedData.steps.map((step, index) => ({
            stepNumber: index + 1,
            instruction: step.instruction,
            imageUrl: step.imageUrl,
          })),
        },
        ingredients: {
          create: await Promise.all(
            validatedData.ingredients.map(async (ing, index) => {
              const ingredient = await tx.ingredient.upsert({
                where: { name: ing.name.toLowerCase() },
                update: {},
                create: { name: ing.name.toLowerCase() },
              });

              return {
                ingredientId: ingredient.id,
                quantity: ing.quantity,
                unit: ing.unit,
                note: ing.note,
                position: index + 1,
              };
            }),
          ),
        },
      },
    });
  });

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
}

export async function deleteRecipe(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Vous devez être connecté pour supprimer une recette");
  }

  await db.recipe.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/recipes");
}

export async function getRecipes() {
  const session = await getSession();
  if (!session) {
    return [];
  }

  return await db.recipe.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
      steps: true,
      categories: {
        include: {
          category: true,
        },
      },
      favorites: {
        where: {
          userId: session.user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRecipeById(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Vous devez être connecté pour voir une recette");
  }

  return await db.recipe.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      steps: {
        orderBy: {
          stepNumber: "asc",
        },
      },
      ingredients: {
        orderBy: {
          position: "asc",
        },
        include: {
          ingredient: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
}

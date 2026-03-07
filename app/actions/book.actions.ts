"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function createBook(data: {
  title: string;
  description?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Vous devez être connecté pour créer un livre");

  const book = await db.book.create({
    data: {
      title: data.title,
      description: data.description,
      userId: session.user.id,
    },
  });

  revalidatePath("/recipes");
  return book;
}

export async function updateBook(
  id: string,
  data: { title: string; description?: string },
) {
  const session = await getSession();
  if (!session) throw new Error("Vous devez être connecté");

  const book = await db.book.update({
    where: { id, userId: session.user.id },
    data,
  });

  revalidatePath("/recipes");
  revalidatePath(`/collections/${id}`);
  return book;
}

export async function deleteBook(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Vous devez être connecté");

  await db.book.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/recipes");
}

export async function getBooks() {
  const session = await getSession();
  if (!session) return [];

  const books = await db.book.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { recipes: true },
      },
      // Optionally getting some internal recipes to show thumbnails
      recipes: {
        take: 3,
        include: {
          recipe: {
            select: { imageUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return books;
}

export async function getBookById(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Vous devez être connecté");

  const book = await db.book.findFirst({
    where: { id, userId: session.user.id },
    include: {
      recipes: {
        include: {
          recipe: {
            include: {
              categories: { include: { category: true } },
              favorites: { where: { userId: session.user.id } },
              _count: { select: { reviews: true } },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  return book;
}

export async function toggleRecipeInBook(bookId: string, recipeId: string) {
  const session = await getSession();
  if (!session) throw new Error("Vous devez être connecté");

  const existing = await db.bookRecipe.findUnique({
    where: {
      bookId_recipeId: { bookId, recipeId },
    },
  });

  if (existing) {
    await db.bookRecipe.delete({
      where: {
        bookId_recipeId: { bookId, recipeId },
      },
    });
  } else {
    // verify the book belongs to user
    const book = await db.book.findFirst({
      where: { id: bookId, userId: session.user.id },
    });
    if (!book) throw new Error("Livre introuvable");

    await db.bookRecipe.create({
      data: { bookId, recipeId },
    });
  }

  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath(`/collections/${bookId}`);
}

export async function removeRecipeFromBook(bookId: string, recipeId: string) {
  const session = await getSession();
  if (!session) throw new Error("Vous devez être connecté");

  await db.bookRecipe.delete({
    where: {
      bookId_recipeId: { bookId, recipeId },
    },
  });

  revalidatePath(`/collections/${bookId}`);
  revalidatePath(`/recipes/${recipeId}`);
}

export async function getBooksWithRecipeStatus(recipeId: string) {
  const session = await getSession();
  if (!session) throw new Error("Vous devez être connecté");

  const books = await db.book.findMany({
    where: { userId: session.user.id },
    include: {
      recipes: {
        where: { recipeId },
        select: { recipeId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return books.map((b) => ({
    id: b.id,
    title: b.title,
    isInBook: b.recipes.length > 0,
  }));
}

export async function getTotalBooksForUser() {
  const session = await getSession();
  if (!session) return 0;

  return await db.book.count({
    where: { userId: session.user.id },
  });
}

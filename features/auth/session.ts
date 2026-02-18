// ─────────────────────────────────────────────────────────
// Gestion des sessions côté serveur (compatible avec Server Actions)
// Utilise des cookies sécurisés avec jose pour le JWT
// ─────────────────────────────────────────────────────────

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Types
export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "moderator";
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface SessionData {
  user: SessionUser;
  expiresAt: number;
}

// Configuration
const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET_KEY || "your-secret-key-min-32-chars-long",
);

// ── Créer une session JWT ─────────────────────────────────
export async function createSession(user: SessionUser): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION;

  const token = await new SignJWT({ user, expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(expiresAt))
    .sign(SECRET_KEY);

  return token;
}

// ── Vérifier et décoder une session JWT ──────────────────
export async function verifySession(
  token: string,
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);

    const sessionData = payload as unknown as SessionData;

    // Vérifier si la session n'est pas expirée
    if (Date.now() > sessionData.expiresAt) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("[verifySession]", error);
    return null;
  }
}

// ── Définir le cookie de session ─────────────────────────
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // en secondes
    path: "/",
  });
}

// ── Supprimer le cookie de session ───────────────────────
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ── Récupérer la session courante ────────────────────────
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

// ── Récupérer l'utilisateur courant ──────────────────────
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

// ── Vérifier si l'utilisateur est connecté ───────────────
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

// ── Vérifier si l'utilisateur est admin ──────────────────
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

// ── Rafraîchir la session (étendre l'expiration) ─────────
export async function refreshSession(): Promise<boolean> {
  const session = await getSession();

  if (!session) {
    return false;
  }

  // Créer un nouveau token avec une nouvelle expiration
  const newToken = await createSession(session.user);
  await setSessionCookie(newToken);

  return true;
}

// ── Middleware helper : require auth ──────────────────────
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Non authentifié");
  }

  return user;
}

// ── Middleware helper : require admin ─────────────────────
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.role !== "admin") {
    throw new Error("Accès refusé : droits administrateur requis");
  }

  return user;
}

// ── Middleware helper : require verified email ────────────
export async function requireVerifiedEmail(): Promise<SessionUser> {
  const user = await requireAuth();

  if (!user.emailVerified) {
    throw new Error("Email non vérifié");
  }

  return user;
}

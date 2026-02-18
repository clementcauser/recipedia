// ─────────────────────────────────────────────────────────
// Middleware Next.js pour protéger les routes avec vérification de session
// S'exécute avant chaque requête pour vérifier l'authentification
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./features/auth/session";

// Routes publiques accessibles sans authentification
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Routes réservées aux admins
const ADMIN_ROUTES = ["/admin"];

// Routes qui nécessitent un email vérifié
const VERIFIED_EMAIL_ROUTES = ["/dashboard", "/projects"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les routes statiques et API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Récupérer le token de session
  const sessionToken = request.cookies.get("session")?.value;

  // Vérifier la session
  const session = sessionToken ? await verifySession(sessionToken) : null;
  const isAuthenticated = session !== null;

  // ── Route publique ────────────────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isPublicRoute) {
    // Si connecté et tente d'accéder à login/signup, rediriger vers dashboard
    if (isAuthenticated && ["/login", "/signup"].includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ── Route protégée : vérifier authentification ────────
  if (!isAuthenticated) {
    // Rediriger vers login avec callbackUrl
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Vérifier si l'email est requis ───────────────────
  const requiresVerifiedEmail = VERIFIED_EMAIL_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (requiresVerifiedEmail && !session.user.emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  // ── Route admin : vérifier le rôle ───────────────────
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Tout est OK, continuer ───────────────────────────
  return NextResponse.next();
}

// Configuration : sur quelles routes le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>(
		"/api/auth/get-session",
		{
			baseURL: process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin,
			headers: {
				cookie: request.headers.get("cookie") || "", 
			},
		},
	);

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/settings");

  // Redirect authenticated users away from login/register pages
	if (isAuthRoute) {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

	return NextResponse.next();
}

export const config = {
	matcher: [
    "/settings/:path*", 
    "/login", 
    "/register",
  ],
};

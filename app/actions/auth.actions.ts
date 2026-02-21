"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error: any) {
    // Ignore redirect error
  }
  return redirect("/login");
}

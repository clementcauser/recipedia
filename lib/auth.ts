import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { Resend } from "resend";
import { db } from "./db";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const auth = betterAuth({
  appName: "Recipedia",
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  user: {
    fields: {
      name: "displayName",
    },
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      if (resend) {
        await resend.emails.send({
          from: "Recipedia <onboarding@resend.dev>",
          to: user.email,
          subject: "Réinitialisez votre mot de passe",
          text: `Cliquez ici pour réinitialiser votre mot de passe : ${url}`,
        });
      } else {
        console.log(
          `\n\n[MOCK EMAIL SERVER]\nEnvoi de l'e-mail de réinitialisation à: ${user.email}\nLien: ${url}\n\n`,
        );
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      if (resend) {
        await resend.emails.send({
          from: "Recipedia <onboarding@resend.dev>",
          to: user.email,
          subject: "Vérifiez votre adresse e-mail",
          text: `Cliquez ici pour vérifier votre compte : ${url}`,
        });
      } else {
        console.log(
          `\n\n[MOCK EMAIL SERVER]\nEnvoi de l'e-mail de vérification à: ${user.email}\nLien de vérification: ${url}\n\n`,
        );
      }
    },
  },
  plugins: [],
});

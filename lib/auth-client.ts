import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL, // the base url of your auth server
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: true },
        lastName: { type: "string", required: true },
      },
    }),
  ],
});

// Better way if supported:
// export const authClient = createAuthClient<typeof auth>({ ... })

export const {
  useSession,
  signIn,
  signOut,
  updateUser,
  changeEmail,
  changePassword,
} = authClient;

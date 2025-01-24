import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { Session } from "next-auth";
import Google from "next-auth/providers/google";
import type { NextRequest } from "next/server";
import { db } from "./src/db/schema.js";
import { checkIsAdminEmail } from "./src/lib/serverHelpers/isAdmin.js";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: DrizzleAdapter(db),
  // debug: true,
  callbacks: {
    session: async ({ session, user }) => {
      const isAdmin = checkIsAdminEmail(user.email);
      return {
        expires: session.expires,
        user: {
          isAdmin,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          id: session.user.id,
        },
      };
    },
  },
  pages: {
    error: "/error",
  },
});

export interface NextAuthRequest extends NextRequest {
  auth: Session | null;
}

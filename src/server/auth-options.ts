// NextAuth v4: email + password, JWT sessions with id and role; role and active re-read every 5 minutes
import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as z from "zod/mini";
import { env } from "@/lib/env";
import { getDb } from "@/server/db";
import { allowAttempt, clearAttempts } from "@/server/rate-limit";
import { checkCredentials, currentStatus } from "@/server/services/sign-in";

const REFRESH_MS = 5 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60;

const credentialsSchema = z.object({ email: z.email(), password: z.string().check(z.minLength(1)) });

export function authOptions(): NextAuthOptions {
  return {
    secret: env().NEXTAUTH_SECRET,
    session: { strategy: "jwt", maxAge: THIRTY_DAYS, updateAge: 24 * 60 * 60 },
    pages: { signIn: "/sign-in" },
    providers: [
      CredentialsProvider({
        name: "Email and password",
        credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
        async authorize(raw, req) {
          const parsed = credentialsSchema.safeParse(raw);
          if (!parsed.success) return null;
          const forwarded = req?.headers?.["x-forwarded-for"];
          const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ?? "local";
          const key = `${parsed.data.email.toLowerCase()}|${ip}`;
          // Surfaces as the "rate_limited" error on the sign-in page
          if (!allowAttempt(key)) throw new Error("rate_limited");
          const user = await checkCredentials(getDb(), parsed.data.email, parsed.data.password);
          if (user) clearAttempts(key);
          return user;
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) return { ...token, id: user.id, role: user.role, active: true, checkedAt: Date.now() };
        if (token.id && Date.now() - (token.checkedAt ?? 0) > REFRESH_MS) {
          const status = await currentStatus(getDb(), token.id);
          return { ...token, role: status?.role, name: status?.name ?? token.name, active: Boolean(status?.active), checkedAt: Date.now() };
        }
        return token;
      },
      async session({ session, token }) {
        if (!token.id || !token.role || token.active === false) return { ...session, user: undefined as never };
        session.user = { id: token.id, name: token.name ?? "", email: token.email ?? "", role: token.role };
        return session;
      },
    },
  };
}

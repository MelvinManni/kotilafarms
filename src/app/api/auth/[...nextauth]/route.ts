// NextAuth endpoints (sign in, sign out, session)
import NextAuth from "next-auth";
import { authOptions } from "@/server/auth-options";

async function handler(req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) {
  return NextAuth(req as never, { params: await ctx.params } as never, authOptions());
}

export { handler as GET, handler as POST };

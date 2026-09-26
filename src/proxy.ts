// Proxy: send signed-out people to /sign-in, and people to /today when their role can't open a page
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { canOpenPath, isPublicPath } from "@/constants/route-access";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const signedIn = Boolean(token?.id && token.role && token.active !== false);
  // API routes answer 401/403 themselves as JSON
  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (!signedIn) {
    const url = new URL("/sign-in", req.url);
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  if (!canOpenPath(pathname, token!.role!)) return NextResponse.redirect(new URL("/today", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico|serwist|icons|manifest.webmanifest).*)"],
};

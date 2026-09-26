import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// middleware.ts — protège /admin/* (ADMIN), /account /orders /checkout (connecté).
// N'importe QUE lib/auth.config.ts (Edge-safe) : pas de Prisma/bcrypt dans le middleware.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  if (
    (pathname.startsWith("/account") ||
      pathname.startsWith("/orders") ||
      pathname.startsWith("/checkout")) &&
    !req.auth?.user
  ) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/orders/:path*", "/checkout/:path*"],
};

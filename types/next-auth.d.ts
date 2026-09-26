// types/next-auth.d.ts — étend la session Auth.js avec id + role.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "CUSTOMER" | "ADMIN";
  }
}

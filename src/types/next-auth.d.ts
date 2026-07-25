import type { DefaultSession } from "next-auth";

import type { UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: UserRole;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    role: UserRole;
    sessionExpiresAt: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    username: string;
    role: UserRole;
    sessionExpiresAt: number;
  }
}

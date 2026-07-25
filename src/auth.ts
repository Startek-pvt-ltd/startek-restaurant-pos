import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";

// Comparing against a fixed hash also performs bcrypt work for unknown users,
// reducing the timing difference between unknown and incorrect credentials.
const DUMMY_PASSWORD_HASH =
  "$2b$12$KIXxOANn/RZgK7mE8YqN2u0i5CW8bVfO7gFNYxyDM6YqF8vU0kDNK";
const DEFAULT_SESSION_AGE = 8 * 60 * 60;
const REMEMBERED_SESSION_AGE = 30 * 24 * 60 * 60;

async function writeActivity(userId: string | undefined, action: "LOGIN" | "LOGOUT") {
  if (!userId) return;

  try {
    await prisma.activityLog.create({ data: { userId, action } });
  } catch (error) {
    // Audit logging should not leave a valid user unable to start or end a session.
    console.error(`Unable to record ${action.toLowerCase()} activity.`, error);
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Username or email",
      credentials: {
        identifier: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "checkbox" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          ...credentials,
          rememberMe: credentials.rememberMe === "true",
        });

        if (!parsed.success) return null;

        const { identifier, password, rememberMe } = parsed.data;
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: { equals: identifier, mode: "insensitive" } },
              { email: { equals: identifier, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            password: true,
            role: true,
            status: true,
          },
        });

        const passwordMatches = await bcrypt.compare(
          password,
          user?.password ?? DUMMY_PASSWORD_HASH,
        );

        if (!user || !passwordMatches || user.status !== "ACTIVE") return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          username: user.username,
          role: user.role,
          rememberMe,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: REMEMBERED_SESSION_AGE,
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const isAuthenticated = Boolean(session?.user);
      const isLoginPage = request.nextUrl.pathname === "/login";

      if (isLoginPage && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return isAuthenticated;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.sessionExpiresAt =
          Date.now() +
          (user.rememberMe ? REMEMBERED_SESSION_AGE : DEFAULT_SESSION_AGE) * 1000;
      }

      if (token.sessionExpiresAt <= Date.now()) return null;

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.name = token.name ?? "";
      session.user.email = token.email ?? "";
      session.user.username = token.username;
      session.user.role = token.role;

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await writeActivity(user.id, "LOGIN");
    },
    async signOut(message) {
      if ("token" in message) {
        await writeActivity(message.token?.sub, "LOGOUT");
      }
    },
  },
});

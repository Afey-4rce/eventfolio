import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "./auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "studio";
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
};

/**
 * Resolve the current session from the `ef_session` cookie.
 * Returns null when there's no valid session.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as "user" | "admin",
    plan: session.user.plan as "free" | "pro" | "studio",
    avatarUrl: session.user.avatarUrl,
    coverUrl: session.user.coverUrl,
    bio: session.user.bio,
  };
}

/** Require a logged-in user — throws 401-style response if missing. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/** Require an admin user. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

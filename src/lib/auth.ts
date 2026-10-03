import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Hash a password using scrypt (Node built-in, no extra deps).
 * Returns `${salt}:${hash}` as a single string.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Verify a plain-text password against a `${salt}:${hash}` string. */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  if (hashBuf.length !== testBuf.length) return false;
  return timingSafeEqual(hashBuf, testBuf);
}

/** Generate a random session token. */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/** Cookie options for the session cookie. */
export const SESSION_COOKIE = "ef_session";
export const SESSION_TTL_DAYS = 30;

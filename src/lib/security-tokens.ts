import { createHash, randomBytes } from "node:crypto";

export function hashSecurityToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSecurityToken() {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    tokenHash: hashSecurityToken(token),
  };
}

export function expiresInMinutes(minutes: number, now = new Date()) {
  return new Date(now.getTime() + minutes * 60_000);
}

export function isExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime();
}

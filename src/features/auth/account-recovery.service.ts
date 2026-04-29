import { AuthTokenType } from "@prisma/client";

import { db } from "@/lib/db";
import { createSecurityToken, expiresInMinutes, hashSecurityToken, isExpired } from "@/lib/security-tokens";

const EMAIL_VERIFICATION_MINUTES = 24 * 60;
const PASSWORD_RESET_MINUTES = 30;

export async function issueEmailVerificationToken(userId: string) {
  return issueAuthToken(userId, AuthTokenType.EMAIL_VERIFICATION, EMAIL_VERIFICATION_MINUTES);
}

export async function issuePasswordResetToken(userId: string) {
  return issueAuthToken(userId, AuthTokenType.PASSWORD_RESET, PASSWORD_RESET_MINUTES);
}

async function issueAuthToken(userId: string, type: AuthTokenType, minutesToLive: number) {
  const { token, tokenHash } = createSecurityToken();

  await db.$transaction([
    db.authToken.deleteMany({
      where: {
        consumedAt: null,
        type,
        userId,
      },
    }),
    db.authToken.create({
      data: {
        expiresAt: expiresInMinutes(minutesToLive),
        tokenHash,
        type,
        userId,
      },
    }),
  ]);

  return token;
}

export async function verifyEmailToken(token: string | null | undefined) {
  const record = await findUsableAuthToken(token, AuthTokenType.EMAIL_VERIFICATION);
  if (!record) {
    return { ok: false, message: "Tautan verifikasi tidak valid atau sudah kedaluwarsa." };
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
    db.authToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
  ]);

  return { ok: true, message: "Email berhasil diverifikasi. Anda bisa masuk sekarang." };
}

export async function findUsablePasswordResetToken(token: string | null | undefined) {
  return findUsableAuthToken(token, AuthTokenType.PASSWORD_RESET);
}

async function findUsableAuthToken(token: string | null | undefined, type: AuthTokenType) {
  const rawToken = token?.trim();
  if (!rawToken) return null;

  const record = await db.authToken.findUnique({
    where: { tokenHash: hashSecurityToken(rawToken) },
    include: { user: true },
  });

  if (!record || record.type !== type || record.consumedAt || isExpired(record.expiresAt)) {
    return null;
  }

  return record;
}

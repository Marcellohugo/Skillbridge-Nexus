import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

type SecurityEventInput = {
  action: string;
  email?: string | null;
  ip?: string | null;
  metadata?: Prisma.InputJsonObject;
  userAgent?: string | null;
  userId?: string | null;
};

export function hashAuditValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  return createHash("sha256").update(trimmed).digest("hex");
}

export async function recordSecurityEvent({
  action,
  email,
  ip,
  metadata,
  userAgent,
  userId,
}: SecurityEventInput) {
  try {
    await db.securityEvent.create({
      data: {
        action,
        email: email?.toLowerCase(),
        ipHash: hashAuditValue(ip),
        metadata,
        userAgent: userAgent?.slice(0, 500),
        userId,
      },
    });
  } catch (error) {
    logger.warn("security_event.persist_failed", {
      action,
      error: error instanceof Error ? error.message : "unknown",
      userId,
    });
  }
}

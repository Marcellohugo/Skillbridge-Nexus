"use server";

import { db } from "@/lib/db";
import { createToken, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import { buildEmailVerificationMessage, buildPasswordResetMessage, sendTransactionalEmail } from "@/lib/email";
import { loginRateLimit, passwordResetRateLimit } from "@/lib/rate-limit";
import { recordSecurityEvent, hashAuditValue } from "@/lib/security-events";
import { hashSecurityToken } from "@/lib/security-tokens";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  findUsablePasswordResetToken,
  issueEmailVerificationToken,
  issuePasswordResetToken,
} from "./account-recovery.service";

const ROLE_REDIRECTS: Record<string, string> = {
  LEARNER: "/dashboard",
  MENTOR: "/mentor/dashboard",
  ADMIN: "/admin/dashboard",
  INSTITUTION_MANAGER: "/institution/dashboard",
};

type HeaderGetter = {
  get(name: string): string | null;
};

function getClientIp(requestHeaders: HeaderGetter) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  if (forwardedIp) return forwardedIp;

  return requestHeaders.get("x-real-ip")?.trim() || "unknown";
}

function getUserAgent(requestHeaders: HeaderGetter) {
  return requestHeaders.get("user-agent")?.trim() || undefined;
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const requestHeaders = await headers();
  const ip = getClientIp(requestHeaders);
  const userAgent = getUserAgent(requestHeaders);
  const rateLimitKey = hashAuditValue(`${ip}:${email}`) ?? `${ip}:${email}`;
  const attempt = await loginRateLimit.check(rateLimitKey);
  if (!attempt.allowed) {
    await recordSecurityEvent({ action: "LOGIN_RATE_LIMITED", email, ip, userAgent });
    return { error: "Terlalu banyak percobaan masuk. Coba lagi beberapa menit." };
  }

  let redirectPath = "/dashboard";

  try {
    const user = await db.user.findUnique({ where: { email } });
    const passwordMatches = user ? bcrypt.compareSync(password, user.passwordHash) : false;

    if (!user || !user.isActive || !passwordMatches) {
      await recordSecurityEvent({
        action: "LOGIN_FAILED",
        email,
        ip,
        metadata: { reason: user?.isActive === false ? "inactive" : "invalid_credentials" },
        userAgent,
        userId: user?.id,
      });
      return { error: "Email atau password salah." };
    }

    if (!user.emailVerified) {
      const token = await issueEmailVerificationToken(user.id);
      await sendTransactionalEmail(buildEmailVerificationMessage({ email: user.email, token }));
      await recordSecurityEvent({
        action: "EMAIL_VERIFICATION_RESENT",
        email,
        ip,
        userAgent,
        userId: user.id,
      });
      return { error: "Email belum diverifikasi. Kami mengirim ulang tautan verifikasi." };
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await loginRateLimit.reset(rateLimitKey);
    await setAuthCookie(token);
    await recordSecurityEvent({ action: "LOGIN_SUCCESS", email, ip, userAgent, userId: user.id });
    redirectPath = ROLE_REDIRECTS[user.role] ?? "/dashboard";

    if (user.role === "LEARNER") {
      const profile = await db.learnerProfile.findUnique({
        where: { userId: user.id },
        select: { onboardingCompleted: true },
      });
      if (profile && !profile.onboardingCompleted) {
        redirectPath = "/onboarding";
      }
    }
  } catch (err) {
    console.error("loginAction error", err);
    return { error: "Terjadi kesalahan, silakan coba lagi." };
  }

  redirect(redirectPath);
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const name = (formData.get("name") as string | null)?.trim();
  const password = formData.get("password") as string | null;
  const role = ((formData.get("role") as string | null) ?? "LEARNER").toUpperCase();

  if (!email || !name || !password) {
    return { error: "Semua field wajib diisi." };
  }
  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }
  if (!["LEARNER", "MENTOR"].includes(role)) {
    return { error: "Role tidak valid." };
  }

  let redirectPath = "/dashboard";

  try {
    const requestHeaders = await headers();
    const ip = getClientIp(requestHeaders);
    const userAgent = getUserAgent(requestHeaders);
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { error: "Email sudah terdaftar." };

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role as "LEARNER" | "MENTOR",
        emailVerified: false,
      },
    });

    if (role === "LEARNER") {
      await db.learnerProfile.create({
        data: {
          userId: user.id,
          fullName: name,
          educationStatus: "Belum diatur",
          onboardingCompleted: false,
          currentTRI: 0,
          triMilestone: "EMERGING",
          careerFitScore: 0,
          riskLevel: "LOW",
        },
      });
      redirectPath = "/onboarding";
    } else if (role === "MENTOR") {
      await db.mentorProfile.create({
        data: {
          userId: user.id,
          biography: "",
          yearsExperience: 0,
          isAvailable: true,
        },
      });
      redirectPath = ROLE_REDIRECTS[role] ?? "/dashboard";
    } else {
      redirectPath = ROLE_REDIRECTS[role] ?? "/dashboard";
    }

    const verificationToken = await issueEmailVerificationToken(user.id);
    await sendTransactionalEmail(buildEmailVerificationMessage({ email: user.email, token: verificationToken }));
    await recordSecurityEvent({
      action: "REGISTERED",
      email,
      ip,
      metadata: { role: user.role, nextPathAfterVerification: redirectPath },
      userAgent,
      userId: user.id,
    });

    return {
      message: "Pendaftaran berhasil. Cek email Anda untuk verifikasi sebelum masuk.",
    };
  } catch (err) {
    console.error("registerAction error", err);
    return { error: "Pendaftaran gagal. Silakan coba lagi." };
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/login");
}

export async function forgotPasswordAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  if (!email) {
    return { error: "Email wajib diisi." };
  }

  try {
    const requestHeaders = await headers();
    const ip = getClientIp(requestHeaders);
    const userAgent = getUserAgent(requestHeaders);
    const rateLimitKey = hashAuditValue(`${ip}:${email}`) ?? `${ip}:${email}`;
    const attempt = await passwordResetRateLimit.check(rateLimitKey);

    if (!attempt.allowed) {
      await recordSecurityEvent({ action: "PASSWORD_RESET_RATE_LIMITED", email, ip, userAgent });
      return { error: "Terlalu banyak permintaan reset. Coba lagi beberapa menit." };
    }

    const user = await db.user.findUnique({ where: { email } });
    if (user?.isActive) {
      const token = await issuePasswordResetToken(user.id);
      await sendTransactionalEmail(buildPasswordResetMessage({ email: user.email, token }));
      await recordSecurityEvent({
        action: "PASSWORD_RESET_REQUESTED",
        email,
        ip,
        userAgent,
        userId: user.id,
      });
    } else {
      await recordSecurityEvent({ action: "PASSWORD_RESET_REQUESTED_UNKNOWN", email, ip, userAgent });
    }
  } catch (err) {
    console.error("forgotPasswordAction error", err);
  }

  return {
    message: "Jika email terdaftar, tautan reset password akan dikirim beberapa saat lagi.",
  };
}

export async function resetPasswordAction(_prev: unknown, formData: FormData) {
  const token = (formData.get("token") as string | null)?.trim();
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;

  if (!token || !password || !confirmPassword) {
    return { error: "Token dan password baru wajib diisi." };
  }
  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }
  if (password !== confirmPassword) {
    return { error: "Konfirmasi password tidak sama." };
  }

  try {
    const requestHeaders = await headers();
    const ip = getClientIp(requestHeaders);
    const userAgent = getUserAgent(requestHeaders);
    const record = await findUsablePasswordResetToken(token);

    if (!record || !record.user.isActive) {
      await recordSecurityEvent({
        action: "PASSWORD_RESET_FAILED",
        ip,
        metadata: token ? { tokenHash: hashSecurityToken(token).slice(0, 12) } : undefined,
        userAgent,
      });
      return { error: "Tautan reset tidak valid atau sudah kedaluwarsa." };
    }

    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: {
          emailVerified: true,
          passwordHash: bcrypt.hashSync(password, 10),
        },
      }),
      db.authToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
      db.authToken.deleteMany({
        where: {
          consumedAt: null,
          type: "PASSWORD_RESET",
          userId: record.userId,
          id: { not: record.id },
        },
      }),
    ]);

    await recordSecurityEvent({
      action: "PASSWORD_RESET_COMPLETED",
      email: record.user.email,
      ip,
      userAgent,
      userId: record.userId,
    });
  } catch (err) {
    console.error("resetPasswordAction error", err);
    return { error: "Reset password gagal. Silakan minta tautan baru." };
  }

  return { message: "Password berhasil diubah. Silakan masuk dengan password baru." };
}

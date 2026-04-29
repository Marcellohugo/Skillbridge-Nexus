import { logger } from "@/lib/logger";

export type TransactionalEmail = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

type AccountEmailInput = {
  appUrl?: string;
  email: string;
  token: string;
};

export function buildUrl(path: string, appUrl = process.env.APP_URL || "http://localhost:3000") {
  return new URL(path, appUrl).toString();
}

export function buildPasswordResetMessage({ appUrl, email, token }: AccountEmailInput): TransactionalEmail {
  const resetUrl = buildUrl(`/reset-password?token=${encodeURIComponent(token)}`, appUrl);

  return {
    to: email,
    subject: "Reset password SkillBridge Nexus",
    text: [
      "Kami menerima permintaan reset password untuk akun SkillBridge Nexus Anda.",
      `Buka tautan ini untuk membuat password baru: ${resetUrl}`,
      "Tautan ini akan kedaluwarsa. Abaikan email ini jika Anda tidak meminta reset password.",
    ].join("\n\n"),
    html: [
      "<p>Kami menerima permintaan reset password untuk akun SkillBridge Nexus Anda.</p>",
      `<p><a href="${resetUrl}">Reset password</a></p>`,
      "<p>Tautan ini akan kedaluwarsa. Abaikan email ini jika Anda tidak meminta reset password.</p>",
    ].join(""),
  };
}

export function buildEmailVerificationMessage({ appUrl, email, token }: AccountEmailInput): TransactionalEmail {
  const verifyUrl = buildUrl(`/verify-email?token=${encodeURIComponent(token)}`, appUrl);

  return {
    to: email,
    subject: "Verifikasi email SkillBridge Nexus",
    text: [
      "Terima kasih sudah mendaftar di SkillBridge Nexus.",
      `Verifikasi email Anda lewat tautan ini: ${verifyUrl}`,
      "Tautan ini akan kedaluwarsa. Abaikan email ini jika Anda tidak membuat akun.",
    ].join("\n\n"),
    html: [
      "<p>Terima kasih sudah mendaftar di SkillBridge Nexus.</p>",
      `<p><a href="${verifyUrl}">Verifikasi email</a></p>`,
      "<p>Tautan ini akan kedaluwarsa. Abaikan email ini jika Anda tidak membuat akun.</p>",
    ].join(""),
  };
}

export async function sendTransactionalEmail(email: TransactionalEmail) {
  const provider = process.env.EMAIL_PROVIDER || "console";

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      throw new Error("RESEND_API_KEY and EMAIL_FROM are required when EMAIL_PROVIDER=resend.");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Email delivery failed with ${response.status}: ${detail}`);
    }

    return;
  }

  logger.info("email.console_delivery", {
    subject: email.subject,
    text: email.text,
    to: email.to,
  });
}

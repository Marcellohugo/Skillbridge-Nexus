"use client";

import Link from "next/link";
import { useActionState } from "react";

import { forgotPasswordAction } from "@/features/auth/auth.actions";
import { useLang } from "@/components/language-provider";
import { Button, Callout, Card, Input, Label } from "@/components/ui";

type RecoveryState = { error?: string; message?: string };

const initial: RecoveryState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<RecoveryState, FormData>(forgotPasswordAction, initial);
  const { t } = useLang();

  return (
    <div id="main" className="auth-shell flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="brand-mark">SN</div>
          <span className="font-display font-bold text-lg">SkillBridge Nexus</span>
        </Link>

        <Card elevated className="auth-card">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold">{t("auth.forgot.title")}</h1>
            <p className="mt-1 text-sm text-foreground-muted">{t("auth.forgot.subtitle")}</p>
          </div>

          <form action={formAction} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email" required>{t("common.email")}</Label>
              <Input id="email" type="email" name="email" placeholder="nama@email.com" required autoComplete="email" />
            </div>

            {state.error && <Callout tone="danger" title={t("auth.forgot.errorTitle")}>{state.error}</Callout>}
            {state.message && <Callout tone="success" title={t("auth.forgot.successTitle")}>{state.message}</Callout>}

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending ? t("auth.forgot.pending") : t("auth.forgot.submit")}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-foreground-muted">
            {t("auth.forgot.remember")}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">{t("auth.login.submit")}</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

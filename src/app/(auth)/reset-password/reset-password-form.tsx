"use client";

import Link from "next/link";
import { useActionState } from "react";

import { useLang } from "@/components/language-provider";
import { Button, Callout, Input, Label } from "@/components/ui";
import { resetPasswordAction } from "@/features/auth/auth.actions";

type ResetState = { error?: string; message?: string };

const initial: ResetState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<ResetState, FormData>(resetPasswordAction, initial);
  const { t } = useLang();
  const hasToken = token.length > 0;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />

      {!hasToken && (
        <Callout tone="danger" title={t("auth.reset.invalidTitle")}>
          {t("auth.reset.invalidMessage")}
        </Callout>
      )}

      <div>
        <Label htmlFor="password" required>{t("auth.reset.newPassword")}</Label>
        <Input id="password" type="password" name="password" placeholder={t("auth.register.passwordPlaceholder")} required minLength={8} autoComplete="new-password" disabled={!hasToken} />
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>{t("auth.reset.confirmPassword")}</Label>
        <Input id="confirmPassword" type="password" name="confirmPassword" placeholder={t("auth.reset.confirmPlaceholder")} required minLength={8} autoComplete="new-password" disabled={!hasToken} />
      </div>

      {state.error && <Callout tone="danger" title={t("auth.reset.errorTitle")}>{state.error}</Callout>}
      {state.message && (
        <Callout tone="success" title={t("auth.reset.successTitle")}>
          {state.message}{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">{t("auth.reset.loginNow")}</Link>
        </Callout>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isPending || !hasToken}>
        {isPending ? t("auth.reset.pending") : t("auth.reset.submit")}
      </Button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/features/auth/auth.actions";
import { useLang } from "@/components/language-provider";
import { Button, Input, Label, Callout, Badge, Progress } from "@/components/ui";

type AuthActionState = { error: string };

const initial: AuthActionState = { error: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(loginAction, initial);
  const { t } = useLang();

  const fillDemo = (email: string) => {
    (document.getElementById("email") as HTMLInputElement).value = email;
    (document.getElementById("password") as HTMLInputElement).value = "password123";
  };

  return (
    <div id="main" className="auth-shell grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="auth-visual hidden flex-col justify-between p-10 lg:flex xl:p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="brand-mark">SN</div>
          <span className="font-display font-bold text-lg">SkillBridge Nexus</span>
        </Link>

        <div className="max-w-lg">
          <Badge tone="success">{t("auth.login.eyebrow")}</Badge>
          <h1 className="mt-4 text-4xl font-display font-black leading-tight xl:text-5xl">{t("auth.login.heroTitle")}</h1>
          <p className="mt-4 max-w-md text-white/80">{t("auth.login.heroSubtitle")}</p>

          <div className="mt-8 grid gap-3">
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-white/60">Talent Readiness Index</p>
                  <p className="mt-2 font-display text-5xl font-black text-white">68.5</p>
                </div>
                <Badge tone="success">+7.2</Badge>
              </div>
              <div className="mt-4">
                <Progress value={68} tone="accent" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[["12", "Modul"], ["4.9", "Mentor"], ["91%", "Match"]].map(([v, k]) => (
                <div key={k} className="rounded-lg border border-white/20 bg-white/10 px-3 py-4 backdrop-blur">
                  <div className="text-2xl font-display font-black text-white">{v}</div>
                  <div className="mt-1 text-xs text-white/60">{k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-white/60">&copy; 2026 SkillBridge Nexus - {t("auth.login.footer")}</p>
      </div>

      <div className="flex min-w-0 items-center justify-center p-5 sm:p-8 lg:p-10">
        <div className="w-full max-w-md min-w-0">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
            <div className="brand-mark">SN</div>
            <span className="font-display font-bold text-lg">SkillBridge Nexus</span>
          </Link>

          <div className="auth-card p-5 sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold">{t("auth.login.title")}</h2>
                <p className="mt-1 text-sm text-foreground-muted">{t("auth.login.subtitle")}</p>
              </div>
              <Badge tone="brand">Demo ready</Badge>
            </div>

            <form action={formAction} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="email" required>{t("common.email")}</Label>
                <Input id="email" type="email" name="email" placeholder="nama@email.com" required autoComplete="email" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" required>{t("common.password")}</Label>
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">{t("auth.login.forgot")}</Link>
                </div>
                <Input id="password" type="password" name="password" placeholder="••••••••" required autoComplete="current-password" />
              </div>

              {state?.error && (
                <Callout tone="danger" title={t("auth.login.errorTitle")}>{state.error}</Callout>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? t("auth.login.pending") : t("auth.login.submit")}
              </Button>
            </form>

            <div className="mt-6 border-t border-border pt-6 text-center text-sm text-foreground-muted">
              {t("auth.login.noAccount")}{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">{t("auth.login.register")}</Link>
            </div>
          </div>

          <div className="mt-5 surface-panel p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-foreground-muted">{t("auth.login.demoTitle")}</p>
              <span className="text-xs text-foreground-muted">{t("common.passwordDemo")}: <span className="font-mono">password123</span></span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Learner", email: "learner@skillbridge.id", tone: "brand" },
                { label: "Mentor", email: "mentor@skillbridge.id", tone: "accent" },
                { label: "Admin", email: "admin@skillbridge.id", tone: "info" },
                { label: "Institusi", email: "institution@skillbridge.id", tone: "success" },
              ].map((d) => (
                <button key={d.email} type="button" onClick={() => fillDemo(d.email)} className="menu-item w-full border border-border bg-background/70 p-2.5 text-left hover:bg-background-secondary">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <Badge tone={d.tone as "brand" | "accent" | "info" | "success"}>{d.label}</Badge>
                      <span className="truncate text-sm font-mono text-foreground-secondary">{d.email}</span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-primary">{t("auth.login.demoUse")}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

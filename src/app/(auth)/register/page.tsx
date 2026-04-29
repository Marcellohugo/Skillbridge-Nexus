"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction } from "@/features/auth/auth.actions";
import { useLang } from "@/components/language-provider";
import { Button, Input, Label, Callout, Badge, Progress } from "@/components/ui";

type AuthActionState = { error?: string; message?: string };

const initial: AuthActionState = { error: "" };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(registerAction, initial);
  const [role, setRole] = useState<"LEARNER" | "MENTOR">("LEARNER");
  const { t } = useLang();

  return (
    <div id="main" className="auth-shell grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="flex min-w-0 items-center justify-center p-5 sm:p-8 lg:p-10">
        <div className="w-full max-w-md min-w-0">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
            <div className="brand-mark">SN</div>
            <span className="font-display font-bold text-lg">SkillBridge Nexus</span>
          </Link>

          <div className="auth-card p-5 sm:p-6">
            <div className="mb-6">
              <Badge tone="accent">{t("auth.register.eyebrow")}</Badge>
              <h2 className="mt-3 text-2xl font-display font-bold">{t("auth.register.title")}</h2>
              <p className="mt-1 text-sm text-foreground-muted">{t("auth.register.subtitle")}</p>
            </div>

            <form action={formAction} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-background-tertiary p-1">
                {[
                  { id: "LEARNER", label: t("auth.register.roleLearner"), desc: t("auth.register.roleLearnerDesc") },
                  { id: "MENTOR", label: t("auth.register.roleMentor"), desc: t("auth.register.roleMentorDesc") },
                ].map((r) => {
                  const on = role === r.id;
                  return (
                    <label key={r.id} className={`cursor-pointer rounded-md p-3 transition-all ${on ? "bg-background border border-primary/45 shadow-sm" : "hover:bg-background/70"}`}>
                      <input type="radio" name="role" value={r.id} checked={on} onChange={() => setRole(r.id as "LEARNER" | "MENTOR")} className="sr-only" />
                      <div className="text-sm font-semibold">{r.label}</div>
                      <div className="mt-0.5 text-xs text-foreground-muted">{r.desc}</div>
                    </label>
                  );
                })}
              </div>

              <div>
                <Label htmlFor="name" required>{t("common.fullName")}</Label>
                <Input id="name" name="name" type="text" required placeholder={t("auth.register.namePlaceholder")} autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="email" required>{t("common.email")}</Label>
                <Input id="email" name="email" type="email" required placeholder="nama@email.com" autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="password" required>{t("common.password")}</Label>
                <Input id="password" name="password" type="password" required minLength={8} placeholder={t("auth.register.passwordPlaceholder")} autoComplete="new-password" />
                <p className="mt-1.5 text-xs text-foreground-muted">{t("auth.register.passwordHint")}</p>
              </div>

              {state?.error && <Callout tone="danger" title={t("auth.register.errorTitle")}>{state.error}</Callout>}
              {state?.message && <Callout tone="success" title={t("auth.register.successTitle")}>{state.message}</Callout>}

              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? t("auth.register.pending") : t("auth.register.submit")}
              </Button>

              <p className="text-center text-xs text-foreground-muted">
                {t("auth.register.termsPrefix")} <a href="#" className="text-primary hover:underline">{t("auth.register.terms")}</a> {t("auth.register.termsJoin")} <a href="#" className="text-primary hover:underline">{t("auth.register.privacy")}</a>.
              </p>
            </form>

            <div className="mt-6 border-t border-border pt-6 text-center text-sm text-foreground-muted">
              {t("auth.register.haveAccount")}{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">{t("auth.register.login")}</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-visual hidden flex-col justify-between p-10 lg:flex xl:p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="brand-mark">SN</div>
          <span className="font-display font-bold text-lg">SkillBridge Nexus</span>
        </Link>

        <div className="max-w-lg">
          <Badge tone="success">{t("auth.register.badgeFree")}</Badge>
          <h1 className="mt-4 text-4xl font-display font-black leading-tight xl:text-5xl">{t("auth.register.heroTitle")}</h1>
          <div className="mt-7 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-white/60">Onboarding readiness</p>
                <p className="mt-1 text-2xl font-display font-black text-white">5 langkah</p>
              </div>
              <Badge tone="accent">{t("auth.register.badgeA11y")}</Badge>
            </div>
            <div className="mt-4">
              <Progress value={54} tone="accent" />
            </div>
          </div>

          <ul className="mt-5 space-y-3 text-sm">
            {[
              ["01", t("auth.register.benefitAssessment"), t("auth.register.benefitAssessmentDesc")],
              ["02", t("auth.register.benefitPath"), t("auth.register.benefitPathDesc")],
              ["03", t("auth.register.benefitMentor"), t("auth.register.benefitMentorDesc")],
              ["04", t("auth.register.benefitTRI"), t("auth.register.benefitTRIDesc")],
              ["05", t("auth.register.benefitA11y"), t("auth.register.benefitA11yDesc")],
            ].map((i) => (
              <li key={i[1]} className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/20 text-[11px] font-bold text-white">{i[0]}</span>
                <div>
                  <div className="font-semibold text-white">{i[1]}</div>
                  <div className="text-white/60">{i[2]}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/60">{t("auth.register.footer")}</p>
      </div>
    </div>
  );
}

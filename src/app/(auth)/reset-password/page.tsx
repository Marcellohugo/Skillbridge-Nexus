import Link from "next/link";
import { cookies } from "next/headers";

import { Card } from "@/components/ui";
import { LOCALE_COOKIE, resolveLocale, translate } from "@/lib/i18n";
import { ResetPasswordForm } from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return (
    <div id="main" className="auth-shell flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="brand-mark">SN</div>
          <span className="font-display font-bold text-lg">SkillBridge Nexus</span>
        </Link>

        <Card elevated className="auth-card">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold">{translate(locale, "auth.reset.title")}</h1>
            <p className="mt-1 text-sm text-foreground-muted">{translate(locale, "auth.reset.subtitle")}</p>
          </div>

          <ResetPasswordForm token={token ?? ""} />
        </Card>
      </div>
    </div>
  );
}

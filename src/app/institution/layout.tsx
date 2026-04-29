import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { DEMO_INSTITUTION } from "@/lib/demo-data";

const NAV: NavItem[] = [
  { href: "/institution/dashboard", label: "Dashboard", labelKey: "nav.dashboard", primary: true },
  { href: "/institution/cohorts",   label: "Cohort",    labelKey: "nav.cohorts",   primary: true },
  { href: "/institution/members",   label: "Anggota",   labelKey: "nav.members",   primary: true },
  { href: "/institution/analytics", label: "Analitik",  labelKey: "nav.analytics", primary: true },
  { href: "/institution/profile",   label: "Profil",    labelKey: "nav.profile",   primary: true },
];

export default async function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "INSTITUTION_MANAGER") redirect("/login");

  return (
    <AppShell
      brandHref="/institution/dashboard"
      navItems={NAV}
      user={{
        name: (session.email as string) || DEMO_INSTITUTION.name,
        role: "Institution Manager",
        roleKey: "role.institution",
        initials: "UT",
      }}
    >
      {children}
    </AppShell>
  );
}

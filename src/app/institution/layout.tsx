import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/institution/dashboard", label: "Dashboard", labelKey: "nav.dashboard", primary: true },
  { href: "/institution/cohorts",   label: "Cohort",    labelKey: "nav.cohorts",   primary: true },
  { href: "/institution/members",   label: "Anggota",   labelKey: "nav.members",   primary: true },
  { href: "/institution/analytics", label: "Analitik",  labelKey: "nav.analytics", primary: true },
  { href: "/institution/profile",   label: "Profil",    labelKey: "nav.profile",   primary: true },
];

function initialsOf(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "IN";
}

export default async function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "INSTITUTION_MANAGER") redirect("/login");
  const displayName = session.name || session.email;

  return (
    <AppShell
      brandHref="/institution/dashboard"
      navItems={NAV}
      user={{
        name: displayName,
        role: "Institution Manager",
        roleKey: "role.institution",
        initials: initialsOf(displayName),
      }}
    >
      {children}
    </AppShell>
  );
}

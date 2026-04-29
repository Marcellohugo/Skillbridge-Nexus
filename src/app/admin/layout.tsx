import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", labelKey: "nav.dashboard", primary: true },
  { href: "/admin/users",     label: "Pengguna",  labelKey: "nav.users",     primary: true },
  { href: "/admin/skills",    label: "Skill",     labelKey: "nav.skills",    primary: true },
  { href: "/admin/analytics", label: "Analitik",  labelKey: "nav.analytics", primary: true },
  { href: "/admin/profile",   label: "Profil",    labelKey: "nav.profile",   primary: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <AppShell
      brandHref="/admin/dashboard"
      navItems={NAV}
      user={{
        name: (session.email as string) || "Admin",
        role: "Administrator",
        roleKey: "role.admin",
        initials: "AD",
      }}
    >
      {children}
    </AppShell>
  );
}

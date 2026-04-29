import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { DEMO_MENTOR } from "@/lib/demo-data";

const NAV: NavItem[] = [
  { href: "/mentor/dashboard", label: "Dashboard", labelKey: "nav.dashboard", primary: true },
  { href: "/mentor/sessions",  label: "Sesi",      labelKey: "nav.sessions",  primary: true },
  { href: "/mentor/learners",  label: "Learner",   labelKey: "nav.learners",  primary: true },
  { href: "/mentor/profile",   label: "Profil",    labelKey: "nav.profile",   primary: true },
];

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") redirect("/login");

  return (
    <AppShell
      brandHref="/mentor/dashboard"
      navItems={NAV}
      user={{
        name: (session.email as string) || DEMO_MENTOR.name,
        role: "Mentor",
        roleKey: "role.mentor",
        initials: "RA",
      }}
    >
      {children}
    </AppShell>
  );
}

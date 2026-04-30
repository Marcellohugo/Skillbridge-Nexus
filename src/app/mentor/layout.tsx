import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/mentor/dashboard", label: "Dashboard", labelKey: "nav.dashboard", primary: true },
  { href: "/mentor/sessions",  label: "Sesi",      labelKey: "nav.sessions",  primary: true },
  { href: "/mentor/learners",  label: "Learner",   labelKey: "nav.learners",  primary: true },
  { href: "/mentor/profile",   label: "Profil",    labelKey: "nav.profile",   primary: true },
];

function initialsOf(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "MT";
}

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") redirect("/login");
  const displayName = session.name || session.email;

  return (
    <AppShell
      brandHref="/mentor/dashboard"
      navItems={NAV}
      user={{
        name: displayName,
        role: "Mentor",
        roleKey: "role.mentor",
        initials: initialsOf(displayName),
      }}
    >
      {children}
    </AppShell>
  );
}

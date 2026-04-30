import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/dashboard",      label: "Dashboard",      labelKey: "nav.dashboard",      primary: true },
  { href: "/learning-path",  label: "Learning Path",  labelKey: "nav.learningPath",   primary: true },
  { href: "/mentors",        label: "Mentor",         labelKey: "nav.mentors",        primary: true },
  { href: "/portfolio",      label: "Portfolio",      labelKey: "nav.portfolio",      primary: true },
  { href: "/coach",          label: "AI Coach",       labelKey: "nav.coach" },
  { href: "/assessment",     label: "Assessment",     labelKey: "nav.assessment" },
  { href: "/skill-gap",      label: "Skill Gap",      labelKey: "nav.skillGap" },
  { href: "/career-compass", label: "Career Compass", labelKey: "nav.careerCompass" },
  { href: "/skill-tree",     label: "Skill Tree",     labelKey: "nav.skillTree" },
  { href: "/skill-synergy",  label: "Skill Synergy",  labelKey: "nav.skillSynergy" },
  { href: "/capstone",       label: "Capstone",       labelKey: "nav.capstone" },
  { href: "/session-prep",   label: "Session Prep",   labelKey: "nav.sessionPrep" },
  { href: "/learning-twin",  label: "Learning Twin",  labelKey: "nav.learningTwin" },
  { href: "/market-value",   label: "Market Value",   labelKey: "nav.marketValue" },
  { href: "/skill-decay",    label: "Skill Decay",    labelKey: "nav.skillDecay" },
  { href: "/calibration",    label: "Calibration",    labelKey: "nav.calibration" },
  { href: "/velocity",       label: "Velocity",       labelKey: "nav.velocity" },
  { href: "/immunity",       label: "Immunity",       labelKey: "nav.immunity" },
  { href: "/career-ladder",  label: "Career Ladder",  labelKey: "nav.careerLadder" },
  { href: "/opportunities",  label: "Opportunities",  labelKey: "nav.opportunities" },
  { href: "/achievements",   label: "Pencapaian",     labelKey: "nav.achievements" },
  { href: "/resume",         label: "Resume",         labelKey: "nav.resume" },
  { href: "/storyteller",    label: "Storyteller",    labelKey: "nav.storyteller" },
  { href: "/mock-interview", label: "Mock Interview", labelKey: "nav.mockInterview" },
];

function initialsOf(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "LR";
}

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") redirect("/login");
  const displayName = session.name || session.email;

  return (
    <AppShell
      brandHref="/dashboard"
      navItems={NAV}
      user={{
        name: displayName,
        role: "Learner",
        roleKey: "role.learner",
        initials: initialsOf(displayName),
      }}
    >
      {children}
    </AppShell>
  );
}

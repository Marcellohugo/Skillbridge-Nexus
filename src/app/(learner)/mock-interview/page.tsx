import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MockInterviewClient } from "./interview-client";

export const metadata = { title: "Mock Interview · SkillBridge Nexus" };

export default async function MockInterviewPage() {
  const session = await getSession();
  let targetSlug: string | null = null;
  let targetName: string | null = null;
  if (session?.role === "LEARNER") {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { targetCareerRole: { select: { slug: true, name: true } } },
    });
    targetSlug = profile?.targetCareerRole?.slug ?? null;
    targetName = profile?.targetCareerRole?.name ?? null;
  }

  return (
    <div className="container-app py-8 lg:py-10 stack-lg stack">
      <header>
        <span className="eyebrow">Latihan interview</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Mock interview generator 🎤</h1>
        <p className="mt-1 text-foreground-secondary max-w-2xl">
          Set 5 pertanyaan interview di-tailor untuk target role kamu ({targetName ?? "generic"}) — mix behavioral, technical, situational, culture.
          Rate jawaban sendiri dan dapatkan STAR hint untuk tiap pertanyaan.
        </p>
      </header>
      <MockInterviewClient targetRoleSlug={targetSlug} targetRoleName={targetName} />
    </div>
  );
}

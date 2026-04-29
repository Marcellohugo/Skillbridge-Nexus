import { AchievementWall } from "@/components/shared/achievement-wall";

export const metadata = { title: "Achievement · SkillBridge Nexus" };

export default function AchievementsPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Koleksi kamu</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Achievement wall 🎖️</h1>
        <p className="mt-1 text-foreground-secondary max-w-2xl">
          Semua badge, milestone, dan pencapaian — terbuka maupun masih terkunci. Hover badge untuk melihat kriteria detail.
        </p>
      </header>

      <AchievementWall />
    </div>
  );
}

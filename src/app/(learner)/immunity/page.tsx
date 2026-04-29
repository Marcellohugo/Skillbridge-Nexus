import { SkillImmunity } from "@/components/shared/skill-immunity";

export default function ImmunityPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack stack-lg">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Future-Proofing</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Skill Immunity Index</h1>
        <p className="text-foreground-secondary max-w-2xl">
          AI dan otomasi tidak menggantikan semua skill secara merata — kategori yang
          membutuhkan <strong>empati, kreativitas, dan penilaian manusiawi</strong> jauh
          lebih tahan banting. Halaman ini mengalikan setiap skor skill Anda dengan
          faktor resilience kategorinya, lalu menggabungkannya menjadi satu{" "}
          <em>Immunity Index</em> 0–100. Empat tier — <strong>Fortress</strong>,{" "}
          <strong>Resilient</strong>, <strong>Exposed</strong>, <strong>Vulnerable</strong> —
          plus rekomendasi tindakan berikutnya.
        </p>
      </header>
      <SkillImmunity />
    </div>
  );
}

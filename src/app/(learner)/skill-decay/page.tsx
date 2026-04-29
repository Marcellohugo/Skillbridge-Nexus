import { SkillDecay } from "@/components/shared/skill-decay";

export default function SkillDecayPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack stack-lg">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Forgetting Curve</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Skill Decay Monitor</h1>
        <p className="text-foreground-secondary max-w-2xl">
          Setiap skill mengikuti kurva lupa Ebbinghaus. Semakin lama tidak dipraktikkan,
          semakin menurun retensinya. Monitor ini memakai snapshot skor terakhir dan
          confidence untuk memperkirakan half-life, lalu menyarankan refresher yang ringkas.
        </p>
      </header>
      <SkillDecay />
    </div>
  );
}

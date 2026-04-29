import { SkillTree } from "@/components/shared/skill-tree";

export default function SkillTreePage() {
  return (
    <div className="stack stack-lg">
      <div>
        <h1 className="font-display font-bold text-3xl">Skill Tree</h1>
        <p className="text-foreground-secondary mt-1">
          Peta prasyarat & skill turunan — lihat apa yang sudah kamu buka dan apa yang menanti.
        </p>
      </div>
      <SkillTree />
    </div>
  );
}

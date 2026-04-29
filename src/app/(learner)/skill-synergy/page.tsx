import { SkillSynergyMap } from "@/components/shared/skill-synergy";

export default function SkillSynergyPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack stack-lg">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Kombinasi Skill</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Skill Synergy Map</h1>
        <p className="text-foreground-secondary max-w-2xl">
          Nilai per-skill saja tidak cukup — sebagian besar peran menuntut{" "}
          <strong>kombinasi</strong> skill yang saling menguatkan. Map ini membaca seluruh
          <em> career role requirement</em> untuk menemukan pasangan yang paling sering muncul bersama,
          lalu membandingkan dengan skor Anda. Hasilnya: pasangan yang sudah aktif, pasangan yang
          tinggal satu skill dari aktif (<strong>bridging opportunity</strong>), dan pasangan pondasi
          yang masih perlu dibangun.
        </p>
      </header>
      <SkillSynergyMap />
    </div>
  );
}

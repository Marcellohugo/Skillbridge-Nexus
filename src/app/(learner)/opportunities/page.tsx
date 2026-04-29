import { OpportunityRadar } from "@/components/shared/opportunity-radar";

export default function OpportunitiesPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack stack-lg">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Cross-Domain Discovery</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Opportunity Radar</h1>
        <p className="text-foreground-secondary max-w-2xl">
          Career Compass menilai Anda terhadap <strong>target</strong>, Career Ladder melihat
          ke <strong>adjacent</strong>. Radar ini berbeda — ia memindai <em>seluruh</em>{" "}
          peran di sistem yang <strong>bukan target dan bukan adjacent</strong>, lalu
          mengurutkan 5 kandidat dengan fit tertinggi. Sering muncul peran lintas-domain
          (marketing, finance, product) yang ternyata dekat karena skill dasar yang dibagi:
          komunikasi, problem-solving, analitik. Berguna untuk menemukan{" "}
          <strong>jalur karier tak terduga</strong>.
        </p>
      </header>
      <OpportunityRadar />
    </div>
  );
}

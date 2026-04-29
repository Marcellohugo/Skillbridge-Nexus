import { CareerLadder } from "@/components/shared/career-ladder";

export default function CareerLadderPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack stack-lg">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Career Planning</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Career Ladder Planner</h1>
        <p className="text-foreground-secondary max-w-2xl">
          Setiap target role punya tetangga — peran-peran adjacent yang berbagi{" "}
          <strong>fondasi skill</strong> dengan target Anda. Ladder ini menghitung biaya
          transisi ke masing-masing pivot: berapa banyak skill yang sudah{" "}
          <em>shared</em>, berapa gap yang tersisa, dan estimasi minggu belajar berdasarkan
          <strong> weekly hours</strong> Anda. Gunakan untuk memetakan{" "}
          <strong>track sekunder</strong> tanpa membuang waktu yang sudah Anda investasikan.
        </p>
      </header>
      <CareerLadder />
    </div>
  );
}

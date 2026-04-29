import { LearningVelocity } from "@/components/shared/learning-velocity";

export default function VelocityPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack stack-lg">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Momentum Belajar</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Learning Velocity &amp; Momentum</h1>
        <p className="text-foreground-secondary max-w-2xl">
          TRI adalah angka, tapi angka saja tidak bercerita — yang penting adalah{" "}
          <strong>seberapa cepat</strong> Anda bergerak dan apakah kecepatan itu{" "}
          <em>naik atau turun</em>. Halaman ini membagi 8 minggu terakhir menjadi dua jendela lalu
          membandingkan velocity-nya — menyingkap momentum: <strong>Sprinting</strong>,{" "}
          <strong>Building</strong>, <strong>Plateau</strong>, atau <strong>Declining</strong> —
          sekaligus memproyeksikan kapan milestone berikutnya tercapai.
        </p>
      </header>
      <LearningVelocity />
    </div>
  );
}

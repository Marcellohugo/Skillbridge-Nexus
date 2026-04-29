import { CalibrationMeter } from "@/components/shared/calibration-meter";

export default function CalibrationPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack stack-lg">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Meta-cognition</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Skill Confidence Calibration</h1>
        <p className="text-foreground-secondary max-w-2xl">
          Anda bisa saja lebih jago dari yang Anda kira — atau sebaliknya. Meter ini
          membandingkan confidence (1–5) yang Anda laporkan saat assessment dengan
          skor aktual, lalu memetakan setiap skill ke salah satu dari tiga zona:
          <strong> Hidden Strength </strong>(impostor), <strong>Terkalibrasi</strong>,
          atau <strong> Blind Spot </strong>(overconfident).
        </p>
      </header>
      <CalibrationMeter />
    </div>
  );
}

import { CareerCompass } from "@/components/shared/career-compass";

export default function CareerCompassPage() {
  return (
    <div className="stack stack-lg">
      <div>
        <h1 className="font-display font-bold text-3xl">Career Compass</h1>
        <p className="text-foreground-secondary mt-1">
          Ranking personal lintas semua role — lihat mana yang paling cocok dari profil skill kamu sekarang.
        </p>
      </div>
      <CareerCompass />
    </div>
  );
}

import { MarketValue } from "@/components/shared/market-value";

export default function MarketValuePage() {
  return (
    <div className="stack stack-lg">
      <div>
        <h1 className="font-display font-bold text-3xl">Skill Market Value</h1>
        <p className="text-foreground-secondary mt-1">
          Estimasi nilai pasar kamu — gabungan salary band role × fit skill × demand multiplier.
        </p>
      </div>
      <MarketValue />
    </div>
  );
}

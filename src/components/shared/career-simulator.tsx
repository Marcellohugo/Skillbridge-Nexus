"use client";

import * as React from "react";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import {
  listCareerRolesAction,
  simulateCareerPathAction,
  type RoleOption,
  type SimulationResult,
} from "@/features/learner/simulator.actions";

export function CareerSimulator({ currentTargetSlug }: { currentTargetSlug?: string | null }) {
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [selected, setSelected] = React.useState<string>("");
  const [result, setResult] = React.useState<SimulationResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await listCareerRolesAction();
      if (res.ok) {
        setRoles(res.roles);
        const initial =
          res.roles.find((r) => r.slug !== currentTargetSlug)?.slug ?? res.roles[0]?.slug ?? "";
        if (initial) {
          setSelected(initial);
          runSim(initial);
        }
      } else {
        setErr(res.error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSim(slug: string) {
    setLoading(true);
    setErr(null);
    const res = await simulateCareerPathAction(slug);
    if (res.ok) setResult(res.data);
    else {
      setErr(res.error);
      setResult(null);
    }
    setLoading(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setSelected(slug);
    runSim(slug);
  };

  const fitColor =
    result && result.fitScore >= 75 ? "text-success" : result && result.fitScore >= 50 ? "text-primary" : "text-warning";

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <span aria-hidden>🔮</span> What-if career simulator
            </span>
          }
          subtitle="Eksplor role lain dan lihat kecocokan instan berdasar skill kamu"
          action={result && <Badge tone="info">{result.role.demandLevel} demand</Badge>}
        />

        <div className="mb-4">
          <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-1.5">
            Pilih target role
          </label>
          <select
            value={selected}
            onChange={handleChange}
            className="input w-full"
            aria-label="Pilih target role untuk simulasi"
          >
            {roles.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name} · {r.industry}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="h-32 animate-pulse bg-background-secondary rounded-xl" />}

        {err && !loading && <p className="text-sm text-danger">{err}</p>}

        {result && !loading && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Fit score</p>
                <p className={`font-display font-black text-3xl mt-0.5 ${fitColor}`}>{result.fitScore}%</p>
              </div>
              <div className="rounded-xl border border-border bg-background-secondary/50 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Rata-rata gap</p>
                <p className="font-display font-black text-3xl mt-0.5 tabular-nums">{result.gapPoints}</p>
              </div>
              <div className="rounded-xl border border-border bg-background-secondary/50 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Weeks to ready</p>
                <p className="font-display font-black text-3xl mt-0.5 tabular-nums">{result.weeksToReady}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background-secondary/40 p-3 text-sm mb-4">
              <span aria-hidden>💬 </span>
              {result.summary}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-success mb-1.5 uppercase tracking-wider">
                  ✓ Kekuatan relevan
                </p>
                {result.strengthMatches.length === 0 ? (
                  <p className="text-xs text-foreground-muted">Belum ada skill yang memenuhi target.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.strengthMatches.map((s) => (
                      <li key={s.skill} className="flex items-center justify-between text-xs">
                        <span>{s.skill}</span>
                        <span className="font-mono text-success">{s.level}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-danger mb-1.5 uppercase tracking-wider">
                  ⚠ Gap kritis
                </p>
                {result.criticalGaps.length === 0 ? (
                  <p className="text-xs text-foreground-muted">Tidak ada gap kritis.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.criticalGaps.map((g) => (
                      <li key={g.skill} className="flex items-center justify-between text-xs">
                        <span>{g.skill}</span>
                        <span className="font-mono">
                          {g.current}% <span className="text-foreground-muted">→ {g.target}%</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {currentTargetSlug !== result.role.slug && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background-secondary/40 p-3">
                <span className="text-xs text-foreground-muted flex-1">
                  Simulasi belum menyimpan. Ubah target permanen di halaman profil.
                </span>
                <Button variant="secondary" size="sm" onClick={() => (window.location.href = "/profile")}>
                  Ke profil →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

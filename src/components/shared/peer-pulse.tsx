"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getPeerPulseAction, type PeerPulseResult } from "@/features/learner/peer.actions";

function percentileLabel(p: number) {
  if (p >= 90) return { text: "Top 10%", tone: "success" as const };
  if (p >= 75) return { text: "Top 25%", tone: "brand" as const };
  if (p >= 50) return { text: "Di atas median", tone: "info" as const };
  if (p >= 25) return { text: "Di bawah median", tone: "warning" as const };
  return { text: "Perlu akselerasi", tone: "danger" as const };
}

export function PeerPulse() {
  const [data, setData] = React.useState<PeerPulseResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const res = await getPeerPulseAction();
      if (!alive) return;
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Peer pulse" subtitle="Memuat data cohort…" />
        <div className="h-32 animate-pulse rounded-lg bg-background-secondary" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Peer pulse" subtitle="Perbandingan anonim dengan cohort" />
        <p className="text-sm text-foreground-muted">{err ?? "Data tidak tersedia."}</p>
      </Card>
    );
  }

  const pLabel = percentileLabel(data.percentile);
  const maxCount = Math.max(...data.distribution.map((d) => d.count), 1);

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              Peer pulse
            </span>
          }
          subtitle={`${data.peerCount > 0 ? `vs ${data.peerCount} peer` : "Belum ada peer"} · ${data.cohortLabel}`}
          action={
            <div className="flex items-center gap-1.5">
              {data.risingStar && <Badge tone="success">Rising star</Badge>}
              <Badge tone={pLabel.tone}>{pLabel.text}</Badge>
            </div>
          }
        />

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Percentile</p>
            <p className="font-display font-black text-2xl mt-0.5 text-primary">{data.percentile}</p>
          </div>
          <div className="rounded-lg border border-border bg-background-secondary/50 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Peringkat</p>
            <p className="font-display font-black text-2xl mt-0.5">#{data.rank}</p>
          </div>
          <div className="rounded-lg border border-border bg-background-secondary/50 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Median cohort</p>
            <p className="font-display font-black text-2xl mt-0.5 tabular-nums">{data.medianTRI.toFixed(0)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-foreground-muted mb-2">Distribusi TRI peer</p>
          <div className="flex items-end gap-1.5 h-24">
            {data.distribution.map((d, i) => {
              const h = (d.count / maxCount) * 100;
              return (
                <div key={`bucket-${d.bucket}-${i}`} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm transition-all ${d.isYou ? "bg-accent" : "bg-foreground-muted/30"}`}
                    style={{ height: `${Math.max(h, 4)}%` }}
                    title={`${d.bucket}: ${d.count}${d.isYou ? " (kamu)" : ""}`}
                  />
                  <span className={`text-[9px] ${d.isYou ? "text-accent font-bold" : "text-foreground-muted"}`}>
                    {d.isYou ? "kamu" : d.bucket}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-xs text-foreground-muted flex items-center justify-between">
          <span>Top performer: {data.topTRI.toFixed(0)} TRI</span>
          <span>Kamu: {data.yourTRI.toFixed(1)} TRI</span>
        </div>

        <p className="text-[11px] text-foreground-muted mt-3">
          Data dianonimkan. Percentile menunjukkan posisi kamu di antara learner dengan target yang sama.
        </p>
      </div>
    </Card>
  );
}

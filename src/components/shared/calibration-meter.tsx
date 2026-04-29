"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import {
  getCalibrationAction,
  type CalibrationResult,
  type CalibrationZone,
} from "@/features/learner/calibration.actions";

const ZONE_ACCENT: Record<CalibrationZone, string> = {
  impostor: "bg-warning",
  calibrated: "bg-success",
  overconfident: "bg-danger",
};

export function CalibrationMeter({ compact = false }: { compact?: boolean }) {
  const [data, setData] = React.useState<CalibrationResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getCalibrationAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Skill Confidence Calibration" subtitle="Persepsi vs performa" />
        <div className="skeleton h-40" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Skill Confidence Calibration" />
        <p className="text-sm text-foreground-muted">{err ?? "Data belum tersedia."}</p>
      </Card>
    );
  }

  if (data.skills.length === 0) {
    return (
      <Card>
        <CardHeader title="Skill Confidence Calibration" subtitle="Butuh snapshot untuk kalibrasi" />
        <p className="text-sm text-foreground-secondary">
          Kalibrasi membutuhkan minimal satu snapshot skill berisi skor + confidence.
          Selesaikan 1 assessment untuk mengaktifkan meter ini.
        </p>
      </Card>
    );
  }

  const total = data.skills.length;
  const pct = {
    impostor: Math.round((data.zoneCounts.impostor / total) * 100),
    calibrated: Math.round((data.zoneCounts.calibrated / total) * 100),
    overconfident: Math.round((data.zoneCounts.overconfident / total) * 100),
  };

  return (
    <Card>
      <CardHeader
        title="Skill Confidence Calibration"
        subtitle="Meta-kognisi: seberapa akurat Anda mengenal kemampuan sendiri"
        action={<Badge tone={data.verdictTone}>Indeks {data.calibrationIndex}</Badge>}
      />

      <div className="rounded-xl border border-border p-4 bg-background-secondary/40 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-foreground-muted">Calibration Index</p>
          <p className="text-xs text-foreground-muted">
            avg conf {data.averageConfidence}/5 · avg score {data.averageScore}
          </p>
        </div>
        <p className="text-3xl font-display font-bold">{data.calibrationIndex}</p>
        <p className="text-sm text-foreground-secondary mt-1">{data.overallVerdict}</p>
      </div>

      <div className="mb-5">
        <div className="flex h-3 rounded-full overflow-hidden bg-background-tertiary">
          {pct.impostor > 0 && <div className={`${ZONE_ACCENT.impostor}`} style={{ width: `${pct.impostor}%` }} />}
          {pct.calibrated > 0 && <div className={`${ZONE_ACCENT.calibrated}`} style={{ width: `${pct.calibrated}%` }} />}
          {pct.overconfident > 0 && <div className={`${ZONE_ACCENT.overconfident}`} style={{ width: `${pct.overconfident}%` }} />}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          <ZoneTally label="Hidden strength" count={data.zoneCounts.impostor} tone="warning" />
          <ZoneTally label="Terkalibrasi" count={data.zoneCounts.calibrated} tone="success" />
          <ZoneTally label="Blind spot" count={data.zoneCounts.overconfident} tone="danger" />
        </div>
      </div>

      <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        <HighlightList
          title="Hidden strengths"
          subtitle="Performa > persepsi — gunakan ini sebagai aset"
          items={data.impostorHighlights}
          emptyText="Tidak ada pola impostor — persepsi Anda akurat."
          accent="warning"
        />
        <HighlightList
          title="Blind spots"
          subtitle="Persepsi > performa — validasi dulu sebelum klaim"
          items={data.blindSpotHighlights}
          emptyText="Tidak ada blind spot — kepercayaan diri selaras."
          accent="danger"
        />
      </div>

      {!compact && (
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted mb-3">Semua skill</p>
          <div className="space-y-2">
            {data.skills.slice(0, 12).map((s) => (
              <DeltaRow key={s.skillId} skill={s} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ZoneTally({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "warning" | "success" | "danger";
}) {
  const dot = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-danger";
  return (
    <div className="flex items-center gap-2 text-foreground-secondary">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="font-medium text-foreground">{count}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function HighlightList({
  title,
  subtitle,
  items,
  emptyText,
  accent,
}: {
  title: string;
  subtitle: string;
  items: CalibrationResult["impostorHighlights"];
  emptyText: string;
  accent: "warning" | "danger";
}) {
  const list = items;
  return (
    <div className="rounded-xl border border-border p-4 bg-background-secondary/40">
      <p className="font-display font-bold text-sm">{title}</p>
      <p className="text-xs text-foreground-muted mb-3">{subtitle}</p>
      {list.length === 0 ? (
        <p className="text-xs text-foreground-secondary">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {list.map((s) => (
            <li key={s.skillId} className="flex items-start gap-2">
              <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${accent === "warning" ? "bg-warning" : "bg-danger"}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {s.name} <span className="text-foreground-muted font-normal">· Δ {s.delta > 0 ? "+" : ""}{s.delta}</span>
                </p>
                <p className="text-xs text-foreground-secondary">{s.insight}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeltaRow({ skill }: { skill: CalibrationResult["skills"][number] }) {
  const { actualScore, expectedFromConfidence: expected, delta, zone, name } = skill;
  const center = 50;
  const scale = 0.5;
  const actualPct = center + (actualScore - 50) * scale;
  const expectedPct = center + (expected - 50) * scale;
  const left = Math.min(actualPct, expectedPct);
  const width = Math.abs(expectedPct - actualPct);
  const barColor =
    zone === "calibrated" ? "bg-success" : zone === "impostor" ? "bg-warning" : "bg-danger";
  return (
    <div className="grid grid-cols-[9rem,1fr,5rem] items-center gap-3 text-xs">
      <span className="truncate font-medium text-foreground-secondary">{name}</span>
      <div className="relative h-2 rounded-full bg-background-tertiary">
        <div className="absolute inset-y-0 w-px bg-foreground-muted/30 left-1/2" />
        <div
          className={`absolute inset-y-0 ${barColor} opacity-60 rounded`}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <span
          className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-foreground border border-background"
          style={{ left: `calc(${actualPct}% - 5px)` }}
          title={`Skor ${actualScore}`}
        />
        <span
          className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary border border-background"
          style={{ left: `calc(${expectedPct}% - 5px)` }}
          title={`Persepsi ${expected}`}
        />
      </div>
      <span className={`text-right font-semibold ${delta > 0 ? "text-danger" : delta < 0 ? "text-warning" : "text-success"}`}>
        {delta > 0 ? "+" : ""}{delta}
      </span>
    </div>
  );
}

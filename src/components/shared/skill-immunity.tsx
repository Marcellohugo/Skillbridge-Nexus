"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import {
  getSkillImmunityAction,
  type ImmunityResult,
  type ImmunitySkill,
} from "@/features/learner/immunity.actions";

export function SkillImmunity({ compact = false }: { compact?: boolean }) {
  const [data, setData] = React.useState<ImmunityResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getSkillImmunityAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Skill Immunity Index" subtitle="Ketahanan terhadap otomasi" />
        <div className="skeleton h-40" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Skill Immunity Index" />
        <p className="text-sm text-foreground-muted">{err ?? "Data belum tersedia."}</p>
      </Card>
    );
  }

  if (data.totalSkills === 0) {
    return (
      <Card>
        <CardHeader title="Skill Immunity Index" subtitle="Butuh snapshot skill" />
        <p className="text-sm text-foreground-secondary">
          Selesaikan 1 assessment untuk mengaktifkan Immunity Index.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Skill Immunity Index"
        subtitle="Seberapa tahan stack Anda terhadap otomasi & AI"
        action={<Badge tone={data.tierTone}>{data.tierLabel}</Badge>}
      />

      <div className="rounded-xl border border-border p-4 bg-background-secondary/40 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-foreground-muted">Immunity Index</p>
          <p className="text-xs text-foreground-muted">
            {data.totalSkills} skill · {data.stackBalance}% high-resilience
          </p>
        </div>
        <div className="flex items-end gap-3">
          <p className="text-4xl font-display font-bold leading-none">{data.immunityIndex}</p>
          <p className="text-xs text-foreground-muted pb-1">/ 100</p>
        </div>
        <p className="text-sm text-foreground-secondary mt-2">{data.verdict}</p>
      </div>

      <section className="mb-5">
        <p className="text-[10px] uppercase tracking-wider text-foreground-muted mb-2">
          Breakdown per kategori
        </p>
        <div className="space-y-2">
          {data.categoryBreakdown.map((c) => (
            <CategoryBar key={c.category} entry={c} />
          ))}
        </div>
      </section>

      <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        <SkillList
          title="Fortress skills"
          subtitle="Human-essential · sulit diotomasi"
          items={data.fortressSkills}
          emptyText="Belum ada skill kategori tinggi resilience."
          accent="success"
        />
        <SkillList
          title="Exposed skills"
          subtitle="Kuat tapi rentan · butuh pelengkap"
          items={data.exposedSkills}
          emptyText="Tidak ada eksposur signifikan."
          accent="warning"
        />
      </div>

      {!compact && (
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted mb-1.5">
            Rekomendasi
          </p>
          <p className="text-sm text-foreground-secondary">{data.recommendation}</p>
        </div>
      )}
    </Card>
  );
}

function CategoryBar({ entry }: { entry: ImmunityResult["categoryBreakdown"][number] }) {
  const pct = Math.min(100, Math.round((entry.contribution / 100) * 100));
  const tone =
    entry.resilience >= 0.75
      ? "bg-success"
      : entry.resilience >= 0.6
        ? "bg-brand"
        : "bg-warning";
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-40 truncate text-foreground-secondary">{entry.category}</span>
      <div className="flex-1 h-2 rounded-full bg-background-tertiary overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-20 text-right tabular-nums">
        <span className="font-semibold">{entry.contribution}</span>
        <span className="text-foreground-muted">
          {" "}
          · r{Math.round(entry.resilience * 100)}
        </span>
      </span>
    </div>
  );
}

function SkillList({
  title,
  subtitle,
  items,
  emptyText,
  accent,
}: {
  title: string;
  subtitle: string;
  items: ImmunitySkill[];
  emptyText: string;
  accent: "success" | "warning";
}) {
  const dotClass = accent === "success" ? "bg-success" : "bg-warning";
  return (
    <div className="rounded-xl border border-border p-4 bg-background-secondary/40">
      <p className="font-display font-bold text-sm">{title}</p>
      <p className="text-xs text-foreground-muted mb-3">{subtitle}</p>
      {items.length === 0 ? (
        <p className="text-xs text-foreground-secondary">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.skillId} className="flex items-start gap-2">
              <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${dotClass}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">
                  {s.name}{" "}
                  <span className="text-foreground-muted font-normal">
                    · {s.score} × r{Math.round(s.resilience * 100)}
                  </span>
                </p>
                <p className="text-xs text-foreground-secondary truncate">{s.category}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

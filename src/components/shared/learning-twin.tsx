"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getLearningTwinAction, type TwinMatch, type TwinResult } from "@/features/learner/twin.actions";

const BADGE_CONFIG: Record<TwinMatch["badge"], { label: string; tone: "success" | "brand" | "accent"; emoji: string }> = {
  mirror: { label: "Mirror Twin", tone: "success", emoji: "👥" },
  accelerator: { label: "Accelerator Twin", tone: "brand", emoji: "🚀" },
  complementary: { label: "Complementary Twin", tone: "accent", emoji: "🧩" },
};

export function LearningTwin() {
  const [data, setData] = React.useState<TwinResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getLearningTwinAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="🤝 Learning Twin" subtitle="Menghitung kemiripan jalur pembelajaran..." />
        <div className="h-32 rounded-lg bg-background-secondary/40 animate-pulse" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="🤝 Learning Twin" />
        <p className="text-sm text-danger">{err ?? "Data tidak tersedia."}</p>
      </Card>
    );
  }

  if (data.matches.length === 0) {
    return (
      <Card>
        <CardHeader
          title="🤝 Learning Twin"
          subtitle={data.yourSkillCount === 0 ? "Belum ada skill snapshot" : "Belum ada peer yang cocok"}
        />
        <p className="text-sm text-foreground-secondary">
          {data.yourSkillCount === 0
            ? "Selesaikan asesmen dulu untuk membangun profil skill. Twin match butuh minimal 2 skill dengan skor."
            : `Cohort ${data.cohortLabel} belum cukup populated (${data.cohortSize} peer). Twin akan muncul saat peer lain mulai aktif.`}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="🤝 Learning Twin"
        subtitle={`Top ${data.matches.length} peer dengan trajektori paling mirip (cohort: ${data.cohortLabel})`}
        action={<Badge tone="muted">{data.cohortSize} peer discanned</Badge>}
      />

      <div className="stack stack-sm">
        {data.matches.map((m, idx) => {
          const cfg = BADGE_CONFIG[m.badge];
          return (
            <div
              key={m.anonId}
              className="rounded-lg border border-border bg-background-secondary/30 p-3"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-display font-bold">{m.displayLabel}</div>
                    <div className="text-[11px] text-foreground-muted">anonim · TRI {Math.round(m.theirTRI)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-2xl tabular-nums text-primary">
                    {m.similarity}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-foreground-muted">Match</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge tone={cfg.tone}>{cfg.emoji} {cfg.label}</Badge>
                {m.triDelta > 0 ? (
                  <Badge tone="info">+{Math.round(m.triDelta)} TRI vs kamu</Badge>
                ) : m.triDelta < 0 ? (
                  <Badge tone="muted">{Math.round(m.triDelta)} TRI vs kamu</Badge>
                ) : (
                  <Badge tone="muted">setara</Badge>
                )}
              </div>

              <p className="text-xs text-foreground-secondary italic mb-2">{m.insight}</p>

              {m.sharedSkills.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-1">
                    Skill yang sama-sama dikembangkan
                  </div>
                  <ul className="stack stack-xs">
                    {m.sharedSkills.map((s) => (
                      <li key={s.name} className="text-xs flex items-center justify-between gap-2">
                        <span className="font-semibold truncate">{s.name}</span>
                        <span className="font-mono tabular-nums text-foreground-muted shrink-0">
                          {s.youLevel} vs {s.theirLevel}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(m.uniqueToThem.length > 0 || m.uniqueToYou.length > 0) && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                  {m.uniqueToThem.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">
                        Mereka punya
                      </div>
                      {m.uniqueToThem.map((s) => (
                        <div key={s.name} className="text-[11px] text-foreground-secondary">
                          + {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.uniqueToYou.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-success mb-1">
                        Kamu punya
                      </div>
                      {m.uniqueToYou.map((s) => (
                        <div key={s.name} className="text-[11px] text-foreground-secondary">
                          + {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-foreground-muted">
        Skor dihitung via cosine similarity vektor skill. Peer ditampilkan anonim — privasi learner terjaga.
      </p>
    </Card>
  );
}

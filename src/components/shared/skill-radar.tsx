"use client";

import * as React from "react";
import { Card, CardHeader } from "@/components/ui";

type SkillPoint = { name: string; current: number; target: number };

export function SkillRadar({
  skills,
  title = "Skill radar",
  subtitle,
  size = 300,
}: {
  skills: SkillPoint[];
  title?: string;
  subtitle?: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const n = skills.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointFor = (i: number, value: number) => {
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r] as const;
  };

  const poly = (values: number[]) =>
    values
      .map((v, i) => pointFor(i, v))
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");

  const currentPoly = poly(skills.map((s) => s.current));
  const targetPoly = poly(skills.map((s) => s.target));

  const rings = [25, 50, 75, 100];

  return (
    <Card className="flex flex-col">
      <CardHeader title={title} subtitle={subtitle ?? "Current vs target"} />
      <div className="flex-1 grid place-items-center">
        <svg width={size} height={size} role="img" aria-label="Skill radar chart">
          {rings.map((r) => (
            <polygon
              key={`ring-${r}`}
              points={Array.from({ length: n })
                .map((_, i) => pointFor(i, r))
                .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeOpacity={r === 100 ? 0.25 : 0.1}
              className="text-foreground-muted"
            />
          ))}
          {Array.from({ length: n }).map((_, i) => {
            const [x, y] = pointFor(i, 100);
            return (
              <line
                key={`axis-${i}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.1}
                className="text-foreground-muted"
              />
            );
          })}

          <polygon points={targetPoly} fill="var(--brand)" fillOpacity={0.12} stroke="var(--brand)" strokeOpacity={0.6} strokeDasharray="4 3" />
          <polygon points={currentPoly} fill="var(--accent)" fillOpacity={0.28} stroke="var(--accent)" strokeWidth={2} />

          {skills.map((s, i) => {
            const [cxp, cyp] = pointFor(i, s.current);
            return <circle key={`pt-${i}`} cx={cxp} cy={cyp} r={3.5} fill="var(--accent)" />;
          })}

          {skills.map((s, i) => {
            const a = angle(i);
            const lx = cx + Math.cos(a) * (radius + 18);
            const ly = cy + Math.sin(a) * (radius + 18);
            return (
              <text
                key={`lbl-${i}`}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground-secondary"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                {s.name}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 flex gap-4 text-xs text-foreground-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Saat ini
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm border"
            style={{ borderColor: "var(--brand)", background: "var(--brand-soft)" }}
          />{" "}
          Target
        </span>
      </div>
    </Card>
  );
}

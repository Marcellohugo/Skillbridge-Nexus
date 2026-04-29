"use client";

import * as React from "react";
import { Card, CardHeader } from "@/components/ui";
import {
  getSkillTreeAction,
  type SkillNode,
  type SkillTreeResult,
} from "@/features/learner/skill-tree.actions";

const COL_W = 180;
const ROW_H = 70;
const PADDING = 20;

type LaidOutNode = SkillNode & { x: number; y: number };

function layoutGraph(nodes: SkillNode[]): { placed: LaidOutNode[]; width: number; height: number } {
  const byDepth = new Map<number, SkillNode[]>();
  for (const n of nodes) {
    const arr = byDepth.get(n.depth) ?? [];
    arr.push(n);
    byDepth.set(n.depth, arr);
  }

  const depths = Array.from(byDepth.keys()).sort((a, b) => a - b);
  const placed: LaidOutNode[] = [];
  let maxRow = 0;

  for (const d of depths) {
    const col = byDepth.get(d)!;
    col.sort((a, b) => {
      if (a.categoryName !== b.categoryName) return a.categoryName.localeCompare(b.categoryName);
      return a.name.localeCompare(b.name);
    });
    col.forEach((n, i) => {
      placed.push({ ...n, x: PADDING + d * COL_W, y: PADDING + i * ROW_H });
      if (i > maxRow) maxRow = i;
    });
  }

  const width = PADDING * 2 + (Math.max(...depths, 0) + 1) * COL_W;
  const height = PADDING * 2 + (maxRow + 1) * ROW_H;
  return { placed, width, height };
}

export function SkillTree() {
  const [data, setData] = React.useState<SkillTreeResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<"all" | "unlocked" | "locked">("all");

  React.useEffect(() => {
    (async () => {
      const res = await getSkillTreeAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="🌲 Skill Dependency Tree" subtitle="Memetakan jalur kompetensi..." />
        <div className="h-48 rounded-lg bg-background-secondary/40 animate-pulse" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="🌲 Skill Dependency Tree" />
        <p className="text-sm text-danger">{err ?? "Data tidak tersedia."}</p>
      </Card>
    );
  }

  if (data.nodes.length === 0) {
    return (
      <Card>
        <CardHeader title="🌲 Skill Dependency Tree" />
        <p className="text-sm text-foreground-secondary">Belum ada skill untuk ditampilkan.</p>
      </Card>
    );
  }

  const { placed, width, height } = layoutGraph(data.nodes);
  const nodeById = new Map(placed.map((n) => [n.id, n]));

  const visibleIds = new Set(
    filter === "all"
      ? placed.map((n) => n.id)
      : placed
          .filter((n) => {
            const prereqs = data.edges.filter((e) => e.to === n.id);
            const unlocked = prereqs.length === 0 || prereqs.every((e) => e.unlocked);
            return filter === "unlocked" ? unlocked : !unlocked;
          })
          .map((n) => n.id),
  );

  const unlockedPct = Math.round((data.unlockedCount / data.totalSkills) * 100);

  return (
    <Card>
      <CardHeader
        title="🌲 Skill Dependency Tree"
        subtitle={`${data.unlockedCount}/${data.totalSkills} unlocked (${unlockedPct}%)`}
        action={
          <div className="flex gap-1">
            {(["all", "unlocked", "locked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-background-secondary text-foreground-muted hover:bg-background-tertiary"
                }`}
              >
                {f === "all" ? "Semua" : f === "unlocked" ? "Terbuka" : "Terkunci"}
              </button>
            ))}
          </div>
        }
      />

      {data.nextUnlock && (
        <div className="mb-3 rounded-lg border border-accent/40 bg-accent/5 p-3 text-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Paling dekat unlock</span>
          <p className="mt-1">
            <strong>{data.nextUnlock.skill}</strong> butuh <strong>{data.nextUnlock.prerequisite}</strong> lvl{" "}
            {data.nextUnlock.needsLevel} (sekarang lvl {data.nextUnlock.currentLevel}).
          </p>
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-border bg-background-secondary/20 max-h-[500px]">
        <svg width={width} height={height} className="block">
          <defs>
            <marker id="arrow-pre" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--color-primary)" />
            </marker>
            <marker id="arrow-rec" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--color-accent)" />
            </marker>
            <marker id="arrow-co" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--color-info, #3b82f6)" />
            </marker>
          </defs>

          {data.edges.map((e, i) => {
            const from = nodeById.get(e.from);
            const to = nodeById.get(e.to);
            if (!from || !to) return null;
            if (!visibleIds.has(e.from) && !visibleIds.has(e.to)) return null;
            const x1 = from.x + 140;
            const y1 = from.y + 22;
            const x2 = to.x;
            const y2 = to.y + 22;
            const midX = (x1 + x2) / 2;
            const path = `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
            return (
              <path
                key={`edge-${e.from}-${e.to}-${i}`}
                d={path}
                fill="none"
                stroke={
                  e.type === "PREREQUISITE"
                    ? "var(--color-primary)"
                    : e.type === "RECOMMENDED"
                      ? "var(--color-accent)"
                      : "var(--color-info, #3b82f6)"
                }
                strokeWidth={e.unlocked ? 2 : 1.2}
                strokeDasharray={e.unlocked ? "0" : "4 3"}
                opacity={e.unlocked ? 0.8 : 0.4}
                markerEnd={`url(#${e.type === "PREREQUISITE" ? "arrow-pre" : e.type === "RECOMMENDED" ? "arrow-rec" : "arrow-co"})`}
              />
            );
          })}

          {placed.map((n) => {
            const visible = visibleIds.has(n.id);
            const prereqEdges = data.edges.filter((e) => e.to === n.id);
            const unlocked = prereqEdges.length === 0 || prereqEdges.every((e) => e.unlocked);
            const hasScore = n.level > 0;
            return (
              <g key={n.id} transform={`translate(${n.x}, ${n.y})`} opacity={visible ? 1 : 0.2}>
                <rect
                  width={140}
                  height={44}
                  rx={8}
                  fill={hasScore ? n.categoryColor : "var(--color-background-secondary)"}
                  fillOpacity={hasScore ? 0.15 : 1}
                  stroke={unlocked ? n.categoryColor : "var(--color-border)"}
                  strokeWidth={n.isFoundational ? 2 : 1}
                  strokeDasharray={unlocked ? "0" : "3 2"}
                />
                <text x={8} y={18} fontSize={11} fontWeight="700" fill="var(--color-foreground)">
                  {n.name.length > 18 ? n.name.slice(0, 17) + "…" : n.name}
                </text>
                <text x={8} y={33} fontSize={9} fill="var(--color-foreground-muted)">
                  {n.categoryName.slice(0, 14)}
                </text>
                {hasScore && (
                  <g>
                    <rect x={100} y={24} width={32} height={12} rx={6} fill={n.categoryColor} fillOpacity={0.2} />
                    <text x={116} y={33} fontSize={9} fontWeight="700" textAnchor="middle" fill={n.categoryColor}>
                      L{n.level}
                    </text>
                  </g>
                )}
                {!unlocked && (
                  <text x={130} y={14} fontSize={10} textAnchor="end">🔒</text>
                )}
                {n.isFoundational && unlocked && (
                  <text x={130} y={14} fontSize={10} textAnchor="end">⭐</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-foreground-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-primary" /> Prerequisite
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-accent" /> Recommended
        </span>
        <span>⭐ Foundational</span>
        <span>🔒 Terkunci (prereq belum cukup)</span>
      </div>
    </Card>
  );
}

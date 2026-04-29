"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Button, Card } from "@/components/ui";
import { compileResumeAction, type ResumeData } from "@/features/learner/resume.actions";

export function ResumeClient() {
  const { format } = useLang();
  const [data, setData] = React.useState<ResumeData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await compileResumeAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="h-96 animate-pulse bg-background-secondary rounded-xl" />;
  }

  if (err || !data) {
    return (
      <Card>
        <p className="text-sm text-danger">{err ?? "Gagal memuat resume."}</p>
      </Card>
    );
  }

  const handlePrint = () => window.print();

  return (
    <div className="stack stack-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <Badge tone={data.triScore >= 70 ? "success" : data.triScore >= 50 ? "brand" : "warning"}>
            TRI {data.triScore.toFixed(0)} · {data.triMilestone.replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => window.location.reload()}>Refresh</Button>
          <Button className="w-full sm:w-auto" onClick={handlePrint}>Cetak / PDF</Button>
        </div>
      </div>

      <div id="resume-sheet" className="bg-white text-slate-900 rounded-xl shadow-lg border border-border p-5 sm:p-10 print:shadow-none print:border-0 print:rounded-none print:p-6">
        <header className="pb-5 border-b-2 border-slate-900">
          <h1 className="text-4xl font-bold tracking-tight">{data.name}</h1>
          <p className="text-slate-600 text-sm mt-1">{data.headline}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <span>✉ {data.email}</span>
            <span>🎓 {data.educationStatus}</span>
            <span>🌐 {data.languages.join(" · ")}</span>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-md border border-slate-200 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Talent Readiness</p>
            <p className="font-bold text-2xl tabular-nums">{data.triScore.toFixed(0)}</p>
          </div>
          <div className="rounded-md border border-slate-200 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Career Fit</p>
            <p className="font-bold text-2xl tabular-nums">{(data.careerFitScore * 100).toFixed(0)}%</p>
          </div>
          <div className="rounded-md border border-slate-200 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Mentoring</p>
            <p className="font-bold text-2xl tabular-nums">{data.mentorshipCount} sesi</p>
          </div>
        </section>

        {data.targetRole && (
          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Career Objective
            </h2>
            <p className="text-sm leading-relaxed">
              Pursuing a <strong>{data.targetRole}</strong> role. Verified via SkillBridge Nexus Talent Readiness Index
              ({data.triScore.toFixed(0)} / 100 — {data.triMilestone.replace(/_/g, " ").toLowerCase()}), with {data.topSkills.length}+ scored competencies and
              {" "}{data.projects.filter((p) => p.isValidated).length} validated evidence artifacts.
            </p>
          </section>
        )}

        {data.topSkills.length > 0 && (
          <section className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {data.topSkills.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-24 text-sm font-medium truncate">{s.name}</div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: `${s.level}%` }} />
                  </div>
                  <span className="text-xs tabular-nums text-slate-600 w-8 text-right">{s.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Evidence & Projects
            </h2>
            <div className="space-y-4">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-sm">
                      {p.title}
                      {p.isValidated && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">✓ Validated</span>}
                    </h3>
                    {p.completedAt && (
                      <span className="text-xs text-slate-500">{format.date(p.completedAt, { month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 mt-1">{p.description}</p>
                  {p.skills.length > 0 && (
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Stack:</strong> {p.skills.join(" · ")}
                    </p>
                  )}
                  {p.projectUrl && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      <strong>Link:</strong> {p.projectUrl}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length === 0 && (
          <section className="mt-6 rounded-md border border-dashed border-slate-300 p-4 text-center">
            <p className="text-sm text-slate-500">Belum ada project di portfolio — tambahkan di halaman Portfolio untuk memperkaya resume.</p>
          </section>
        )}

        {data.badges.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Micro-Credentials
            </h2>
            <ul className="text-sm grid grid-cols-2 gap-x-6">
              {data.badges.map((b) => (
                <li key={b.name} className="flex items-baseline gap-2">
                  <span className="font-semibold">🎖️ {b.name}</span>
                  <span className="text-xs text-slate-500">— {format.date(b.earnedAt, { month: "short", year: "numeric" })}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-8 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Generated by SkillBridge Nexus · Verified Talent Readiness data</span>
          <span>{format.date(new Date(), { day: "numeric", month: "long", year: "numeric" })}</span>
        </footer>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-sheet, #resume-sheet * { visibility: visible; }
          #resume-sheet { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

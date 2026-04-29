"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Button, Callout, Card, CardHeader, Input, Label, StatCard } from "@/components/ui";
import {
  listMatchedMentorsAction,
  requestMentorSessionAction,
  type MentorCandidate,
} from "@/features/learner/mentor.actions";

type Sort = "match" | "rating" | "sessions" | "experience";

const DAY_LABEL: Record<number, string> = { 0: "Min", 1: "Sen", 2: "Sel", 3: "Rab", 4: "Kam", 5: "Jum", 6: "Sab" };

export default function MentorsPage() {
  const [mentors, setMentors] = React.useState<MentorCandidate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<Sort>("match");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [requestOpen, setRequestOpen] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);
  const [requested, setRequested] = React.useState<Set<string>>(new Set());
  const [draft, setDraft] = React.useState({ scheduledAt: "", duration: "60", topic: "", notes: "" });

  React.useEffect(() => {
    (async () => {
      const res = await listMatchedMentorsAction();
      if (res.ok) {
        setMentors(res.data);
        if (res.data[0]) setActiveId(res.data[0].mentorId);
      } else {
        setErr(res.error);
      }
      setLoading(false);
    })();
  }, []);

  const list = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = mentors.filter((m) => {
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.industries.some((i) => i.toLowerCase().includes(q)) ||
        m.expertiseSkills.some((e) => e.name.toLowerCase().includes(q)) ||
        m.mentoringTopics.some((t) => t.toLowerCase().includes(q))
      );
    });
    arr = [...arr].sort((a, b) => {
      if (sort === "match") return b.matchScore - a.matchScore;
      if (sort === "rating") return b.avgRating - a.avgRating;
      if (sort === "experience") return b.yearsExperience - a.yearsExperience;
      return b.totalSessions - a.totalSessions;
    });
    return arr;
  }, [mentors, search, sort]);

  const active = list.find((m) => m.mentorId === activeId) ?? list[0];
  const stats = React.useMemo(() => {
    const avgMatch = mentors.length > 0 ? Math.round(mentors.reduce((s, m) => s + m.matchScore, 0) / mentors.length) : 0;
    const strong = mentors.filter((m) => m.matchScore >= 70).length;
    const withSlots = mentors.filter((m) => m.availability.length > 0).length;
    return { avgMatch, strong, withSlots };
  }, [mentors]);

  const submitRequest = async () => {
    if (!active || !draft.scheduledAt) return;
    setRequesting(true);
    setErr(null);
    const res = await requestMentorSessionAction({
      mentorId: active.mentorId,
      scheduledAt: draft.scheduledAt,
      durationMinutes: Number(draft.duration) || 60,
      topic: draft.topic.trim() || undefined,
      notes: draft.notes.trim() || undefined,
    });
    setRequesting(false);
    if (res.ok) {
      setRequested((s) => new Set(s).add(active.mentorId));
      setRequestOpen(false);
      setDraft({ scheduledAt: "", duration: "60", topic: "", notes: "" });
    } else {
      setErr(res.error);
    }
  };

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="skeleton h-32" />
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="container-app py-8 lg:py-10 stack-xl stack">
        <header>
          <span className="eyebrow">Mentor Matching</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Mentor untuk Anda</h1>
        </header>
        <Callout tone="warning">
          {err ?? "Belum ada mentor tersedia. Pastikan database sudah di-seed dengan profil mentor + expertise."}
        </Callout>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Mentor Matching</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Mentor untuk Anda</h1>
          <p className="mt-1 text-foreground-secondary">
            Matching berbasis gap kritis, gaya komunikasi, dan industri target — setiap alasan dapat dijelaskan.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/skill-gap" className="btn btn-secondary">Lihat Gap</Link>
          <Link href="/learning-path" className="btn btn-primary">Learning Path →</Link>
        </div>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Match rata-rata" value={`${stats.avgMatch}%`} tone="brand" delta={`${mentors.length} mentor`} hint="Skor cocok dengan profil Anda" />
        <StatCard label="Top mentor" value={`${stats.strong}`} tone="success" delta="match ≥70%" hint="Direkomendasikan kuat" />
        <StatCard label="Siap booking" value={`${stats.withSlots}`} tone="info" delta="slot tersedia" hint="Mentor dengan availability" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Hasil matching"
            subtitle={`${list.length} mentor`}
            action={
              <div className="grid w-full grid-cols-[minmax(0,1fr),7.5rem] gap-2 sm:w-auto sm:grid-cols-[minmax(12rem,1fr),8rem]">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari skill, industri…" className="h-9 min-w-0 text-sm" />
                <select aria-label="Urutkan mentor" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input h-9 text-sm py-0">
                  <option value="match">Match</option>
                  <option value="rating">Rating</option>
                  <option value="experience">Pengalaman</option>
                  <option value="sessions">Sesi</option>
                </select>
              </div>
            }
          />
          <div className="space-y-3">
            {list.map((m) => (
              <MentorRow key={m.mentorId} mentor={m} active={m.mentorId === active?.mentorId} onClick={() => setActiveId(m.mentorId)} requested={requested.has(m.mentorId)} />
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {active && <MentorDetail mentor={active} onRequest={() => setRequestOpen(true)} requested={requested.has(active.mentorId)} />}
          <Callout tone="brand" title="🎯 Match cerdas">
            Match score = 50% skill-overlap + 20% peran/industri + 15% gaya komunikasi + 10% availability + 5% bahasa. Setiap alasan terbaca di kartu detail.
          </Callout>
        </div>
      </div>

      {requestOpen && active && (
        <Card elevated>
          <CardHeader
            title={`Request sesi dengan ${active.name}`}
            subtitle="Isi jadwal dan topik — mentor akan notifikasi untuk accept/reschedule"
            action={<button type="button" onClick={() => setRequestOpen(false)} className="text-sm text-foreground-muted">Batal</button>}
          />
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="scheduledAt" required>Tanggal & jam</Label>
                <Input id="scheduledAt" type="datetime-local" value={draft.scheduledAt} onChange={(e) => setDraft({ ...draft, scheduledAt: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="duration">Durasi (menit)</Label>
                <Input id="duration" type="number" min="15" max="180" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="topic">Topik <span className="text-foreground-muted font-normal">(opsional)</span></Label>
              <Input id="topic" value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} placeholder={active.sharedGapSkills[0] ? `Review ${active.sharedGapSkills[0]}` : "Career coaching"} />
            </div>
            <div>
              <Label htmlFor="notes">Catatan untuk mentor <span className="text-foreground-muted font-normal">(opsional)</span></Label>
              <textarea id="notes" rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className="input" placeholder="Konteks yang ingin Anda diskusikan…" />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setRequestOpen(false)}>Batal</Button>
              <Button onClick={submitRequest} disabled={requesting || !draft.scheduledAt} className="flex-1">
                {requesting ? "Mengirim…" : "Kirim permintaan"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function MentorRow({ mentor, active, onClick, requested }: { mentor: MentorCandidate; active: boolean; onClick: () => void; requested: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        active ? "border-primary/50 bg-primary/5" : "border-border hover:border-border-strong bg-background-secondary/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold shrink-0">{mentor.initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{mentor.name}</p>
            <Badge tone={mentor.matchScore >= 80 ? "success" : mentor.matchScore >= 60 ? "brand" : "muted"}>{mentor.matchScore}% match</Badge>
            {requested && <Badge tone="info">✓ Requested</Badge>}
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            {mentor.yearsExperience}th pengalaman · {mentor.industries.slice(0, 2).join(", ")}
          </p>
          {mentor.matchReasons[0] && (
            <p className="text-xs text-foreground-secondary mt-1.5 line-clamp-1">✓ {mentor.matchReasons[0].label}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-foreground-muted">★ {mentor.avgRating.toFixed(1)}</p>
          <p className="text-xs text-foreground-muted mt-1">{mentor.totalSessions} sesi</p>
        </div>
      </div>
    </button>
  );
}

function MentorDetail({ mentor, onRequest, requested }: { mentor: MentorCandidate; onRequest: () => void; requested: boolean }) {
  return (
    <Card elevated>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-14 w-14 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white text-lg font-bold">{mentor.initials}</div>
        <div className="flex-1">
          <p className="font-display font-bold text-lg">{mentor.name}</p>
          <p className="text-xs text-foreground-muted">{mentor.yearsExperience}th · {mentor.industries[0]}</p>
        </div>
      </div>
      <p className="text-sm text-foreground-secondary mb-5">{mentor.biography}</p>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <Mini label="Match" value={`${mentor.matchScore}%`} accent />
        <Mini label="Rating" value={`${mentor.avgRating.toFixed(1)}★`} />
        <Mini label="Sesi" value={`${mentor.totalSessions}`} />
      </div>

      <p className="text-xs uppercase tracking-wider text-foreground-muted mb-2">Alasan match</p>
      <ul className="space-y-2 mb-5">
        {mentor.matchReasons.map((r, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-success mt-0.5">✓</span>
            <span className="text-foreground-secondary">{r.label}</span>
          </li>
        ))}
        {mentor.matchReasons.length === 0 && (
          <li className="text-xs text-foreground-muted">Belum ada overlap kuat — boleh dipertimbangkan untuk eksplorasi lintas domain.</li>
        )}
      </ul>

      <p className="text-xs uppercase tracking-wider text-foreground-muted mb-2">Keahlian</p>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {mentor.expertiseSkills.slice(0, 8).map((e) => (
          <span key={e.skillId} className="chip">
            {e.name} <span className="text-foreground-muted">L{e.level}</span>
          </span>
        ))}
      </div>

      {mentor.availability.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-wider text-foreground-muted mb-2">Availability</p>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {mentor.availability.slice(0, 6).map((a, i) => (
              <span key={i} className="chip text-xs">{DAY_LABEL[a.dayOfWeek]} {a.startTime}–{a.endTime}</span>
            ))}
          </div>
        </>
      )}

      <Button className="w-full" onClick={onRequest} disabled={requested}>
        {requested ? "✓ Permintaan terkirim" : "Minta Sesi 1:1 →"}
      </Button>
    </Card>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background-secondary/50 px-3 py-2.5 text-center">
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className={`text-sm font-display font-bold mt-0.5 ${accent ? "glow-text" : ""}`}>{value}</p>
    </div>
  );
}

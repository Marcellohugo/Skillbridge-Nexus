"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Button, Card, CardHeader, Label, StatCard, Callout } from "@/components/ui";
import {
  listIncomingSessionsAction,
  acceptSessionAction,
  rejectSessionAction,
  completeSessionAction,
  type MentorSessionRow,
} from "@/features/mentor/session.actions";

type Tab = "pending" | "upcoming" | "past";

export default function MentorSessionsPage() {
  const { format } = useLang();
  const [rows, setRows] = React.useState<MentorSessionRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<Tab>("pending");
  const [completeFor, setCompleteFor] = React.useState<string | null>(null);
  const [actionItems, setActionItems] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const refresh = React.useCallback(async () => {
    const res = await listIncomingSessionsAction();
    if (res.ok) setRows(res.data);
    else setErr(res.error);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const pending = rows.filter((r) => r.status === "PENDING");
  const upcoming = rows.filter((r) => r.status === "ACCEPTED" && new Date(r.scheduledAt) >= new Date());
  const past = rows.filter((r) => r.status === "COMPLETED" || new Date(r.scheduledAt) < new Date());

  const visible = tab === "pending" ? pending : tab === "upcoming" ? upcoming : past;

  const accept = async (id: string) => {
    setErr(null);
    const res = await acceptSessionAction(id);
    if (res.ok) await refresh();
    else setErr(res.error);
  };
  const reject = async (id: string) => {
    if (!confirm("Tolak sesi ini?")) return;
    const res = await rejectSessionAction(id);
    if (res.ok) await refresh();
    else setErr(res.error);
  };
  const submitComplete = async (id: string) => {
    const items = actionItems.split("\n").map((x) => x.trim()).filter(Boolean);
    const res = await completeSessionAction(id, items, notes || undefined, items.length * 2);
    if (res.ok) {
      setCompleteFor(null);
      setActionItems("");
      setNotes("");
      await refresh();
    } else {
      setErr(res.error);
    }
  };

  if (loading) return <div className="container-app py-8"><div className="skeleton h-32" /></div>;

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Sesi Mentoring</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Kelola Sesi</h1>
        <p className="mt-1 text-foreground-secondary">Terima, jadwal ulang, atau selesaikan sesi dari learner.</p>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={`${pending.length}`} tone="warning" delta="menunggu" />
        <StatCard label="Mendatang" value={`${upcoming.length}`} tone="brand" delta="accepted" />
        <StatCard label="Selesai" value={`${rows.filter((r) => r.status === "COMPLETED").length}`} tone="success" />
        <StatCard label="Total" value={`${rows.length}`} tone="accent" />
      </div>

      <div className="flex gap-1 p-1 bg-background-secondary border border-border rounded-xl w-fit">
        {([["pending", `Pending (${pending.length})`], ["upcoming", `Mendatang (${upcoming.length})`], ["past", `Riwayat (${past.length})`]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 h-9 text-sm font-medium rounded-lg transition-colors ${tab === id ? "bg-background-tertiary text-foreground" : "text-foreground-muted hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={tab === "pending" ? "Permintaan menunggu" : tab === "upcoming" ? "Sesi mendatang" : "Riwayat sesi"} subtitle={`${visible.length} sesi`} />
        {visible.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-8">Belum ada sesi di tab ini.</p>
        ) : (
          <div className="space-y-3">
            {visible.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-background-secondary/40 p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold shrink-0">{s.menteeInitials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm">{s.menteeName}</p>
                      <Badge tone={s.status === "COMPLETED" ? "success" : s.status === "ACCEPTED" ? "brand" : s.status === "PENDING" ? "warning" : "muted"}>
                        {s.status}
                      </Badge>
                    </div>
                    {s.topic && <p className="text-xs text-foreground-muted mt-0.5">{s.topic}</p>}
                    <p className="text-xs text-foreground-secondary mt-1">⏰ {format.dateTime(s.scheduledAt)} · {s.durationMinutes}m</p>
                    {s.notes && <p className="text-xs text-foreground-secondary mt-2 italic">&ldquo;{s.notes}&rdquo;</p>}
                    {s.actionItems.length > 0 && (
                      <ul className="mt-2 text-xs space-y-1">
                        {s.actionItems.map((a, i) => (
                          <li key={i} className="flex gap-1.5"><span className="text-success">✓</span><span>{a}</span></li>
                        ))}
                      </ul>
                    )}
                    {s.menteeRating !== null && (
                      <p className="text-xs mt-2 text-warning">Rating: {"★".repeat(s.menteeRating)}{s.menteeFeedback ? ` — "${s.menteeFeedback}"` : ""}</p>
                    )}
                  </div>
                </div>
                {s.status === "PENDING" && (
                  <div className="flex gap-2 mt-3">
                    <Button onClick={() => accept(s.id)} className="flex-1">Terima</Button>
                    <Button variant="secondary" onClick={() => reject(s.id)}>Tolak</Button>
                  </div>
                )}
                {s.status === "ACCEPTED" && new Date(s.scheduledAt) < new Date() && (
                  <div className="mt-3">
                    {completeFor === s.id ? (
                      <div className="space-y-2">
                        <Label htmlFor={`ai-${s.id}`}>Action items (satu per baris)</Label>
                        <textarea id={`ai-${s.id}`} rows={3} value={actionItems} onChange={(e) => setActionItems(e.target.value)} className="input" placeholder="Refactor useAuth hook&#10;Bangun 2 komponen dari Figma" />
                        <Label htmlFor={`no-${s.id}`}>Catatan sesi</Label>
                        <textarea id={`no-${s.id}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
                        <div className="flex gap-2">
                          <Button onClick={() => submitComplete(s.id)} className="flex-1">Submit selesai</Button>
                          <Button variant="secondary" onClick={() => setCompleteFor(null)}>Batal</Button>
                        </div>
                      </div>
                    ) : (
                      <Button onClick={() => setCompleteFor(s.id)}>Tandai selesai</Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

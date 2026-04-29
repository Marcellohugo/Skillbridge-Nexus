"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader, Input, StatCard, Callout } from "@/components/ui";
import { listPlatformUsersAction, setUserActiveAction, type PlatformUserRow } from "@/features/admin/platform.actions";

type RoleFilter = "all" | "LEARNER" | "MENTOR" | "ADMIN" | "INSTITUTION_MANAGER";

export default function AdminUsersPage() {
  const { format } = useLang();
  const [rows, setRows] = React.useState<PlatformUserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");

  const refresh = async () => {
    const res = await listPlatformUsersAction();
    if (res.ok) setRows(res.data);
    else setErr(res.error);
  };

  React.useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase()) && !r.email.toLowerCase().includes(q.toLowerCase())) return false;
    if (roleFilter !== "all" && r.role !== roleFilter) return false;
    return true;
  });

  const stats = {
    total: rows.length,
    active: rows.filter((r) => r.isActive).length,
    learners: rows.filter((r) => r.role === "LEARNER").length,
    mentors: rows.filter((r) => r.role === "MENTOR").length,
  };

  const toggle = async (id: string, cur: boolean) => {
    const res = await setUserActiveAction(id, !cur);
    if (res.ok) await refresh();
    else setErr(res.error);
  };

  if (loading) return <div className="container-app py-8"><div className="skeleton h-32" /></div>;

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">User Management</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Kelola User</h1>
        <p className="mt-1 text-foreground-secondary">Semua akun platform — aktifkan/non-aktifkan dengan audit trail.</p>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total user" value={`${stats.total}`} tone="brand" />
        <StatCard label="Aktif" value={`${stats.active}`} tone="success" delta={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%`} />
        <StatCard label="Learner" value={`${stats.learners}`} tone="info" />
        <StatCard label="Mentor" value={`${stats.mentors}`} tone="accent" />
      </div>

      <Card>
        <CardHeader
          title="User list"
          subtitle={`${filtered.length}/${rows.length}`}
          action={
            <div className="flex gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama/email…" className="h-9 text-sm" />
              <select aria-label="Filter role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as RoleFilter)} className="input h-9 text-sm py-0">
                <option value="all">Semua role</option>
                <option value="LEARNER">Learner</option>
                <option value="MENTOR">Mentor</option>
                <option value="INSTITUTION_MANAGER">Institution</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          }
        />
        <div className="divide-y divide-border">
          {filtered.map((u) => (
            <div key={u.id} className="py-3 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold text-sm shrink-0">
                {u.name.split(" ").map((p) => p[0] ?? "").slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-sm">{u.name}</p>
                  <Badge tone={u.role === "ADMIN" ? "danger" : u.role === "MENTOR" ? "brand" : u.role === "INSTITUTION_MANAGER" ? "accent" : "info"}>{u.role}</Badge>
                  {!u.isActive && <Badge tone="warning">Inactive</Badge>}
                </div>
                <p className="text-xs text-foreground-muted truncate">{u.email} · bergabung {format.date(u.createdAt)}</p>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                {u.currentTRI !== undefined && <p className="text-sm font-semibold tabular-nums">TRI {u.currentTRI}</p>}
                {u.completedSessions !== undefined && <p className="text-xs text-foreground-muted">{u.completedSessions} sesi</p>}
              </div>
              <button
                type="button"
                onClick={() => toggle(u.id, u.isActive)}
                className={`text-xs px-3 h-8 rounded-lg border ${u.isActive ? "border-warning text-warning hover:bg-warning/10" : "border-success text-success hover:bg-success/10"}`}
              >
                {u.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-foreground-muted py-8">Tidak ada user.</p>}
        </div>
      </Card>
    </div>
  );
}

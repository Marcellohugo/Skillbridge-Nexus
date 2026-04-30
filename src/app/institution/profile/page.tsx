import { Badge, Card, CardHeader, Callout, StatCard } from "@/components/ui";
import { getInstitutionAnalyticsAction } from "@/features/institution/analytics.actions";

export default async function InstitutionProfilePage() {
  const result = await getInstitutionAnalyticsAction();
  const data = result.ok ? result.data : null;

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Institution Settings</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Profil Institusi</h1>
          <p className="mt-1 text-foreground-secondary">Informasi institusi dan statistik keanggotaan dari database.</p>
        </div>
        <Badge tone="success">Verified</Badge>
      </header>

      {!data && (
        <Callout tone="warning" title="Profil institusi belum tersedia">
          {result.ok ? "Belum ada data institusi." : result.error}
        </Callout>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total learner" value={data.totalLearners} tone="brand" />
            <StatCard label="Kohort aktif" value={data.cohortCount} tone="accent" />
            <StatCard label="At-risk" value={data.atRiskCount} tone={data.atRiskCount > 0 ? "warning" : "success"} />
            <StatCard label="Career ready" value={`${data.careerReadyPct}%`} tone="info" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader title="Informasi institusi" subtitle="Data profil organisasi" />
                <div className="space-y-4">
                  <Field label="Nama Institusi" value={data.institutionName} />
                  <Field label="Tipe" value="Institution Partner" />
                  <Field label="Rata-rata TRI" value={`${data.avgTRI}`} />
                </div>
              </Card>

              <Card>
                <CardHeader title="Cohort" subtitle="Ringkasan cohort dalam institusi" />
                <div className="space-y-3">
                  {data.cohorts.map((cohort) => (
                    <div key={cohort.id} className="flex items-center justify-between rounded-lg border border-border bg-background-secondary/40 p-3">
                      <div>
                        <p className="text-sm font-semibold">{cohort.name}</p>
                        <p className="text-xs text-foreground-muted">{cohort.learnerCount} learner · Avg TRI {cohort.avgTRI}</p>
                      </div>
                      <Badge tone={cohort.atRiskCount > 0 ? "warning" : "success"}>{cohort.careerReadyPct}% ready</Badge>
                    </div>
                  ))}
                  {data.cohorts.length === 0 && <p className="text-sm text-foreground-muted">Belum ada cohort.</p>}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <div className="text-center">
                  <div className="brand-mark mx-auto grid h-20 w-20 place-items-center text-2xl">IN</div>
                  <h3 className="mt-3 font-display text-lg font-bold">{data.institutionName}</h3>
                  <p className="text-sm text-foreground-muted">Institution Partner</p>
                  <Badge tone="success" className="mt-2">Verified</Badge>
                </div>
              </Card>

              <Callout tone="info" title="Data aktif">
                Statistik profil ini dihitung dari cohort, learner, dan intervensi yang tersimpan di database.
              </Callout>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="input flex items-center">{value || "-"}</div>
    </div>
  );
}

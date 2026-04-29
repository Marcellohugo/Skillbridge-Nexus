import { ResumeClient } from "./resume-client";

export const metadata = { title: "Resume · SkillBridge Nexus" };

export default function ResumePage() {
  return (
    <div className="container-app py-8 lg:py-10 stack-lg stack">
      <header className="print:hidden">
        <span className="eyebrow">Tangible output</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Resume otomatis 📄</h1>
        <p className="mt-1 text-foreground-secondary max-w-2xl">
          Satu-halaman resume yang dirakit dari profil, top skill, portfolio proyek, micro-credential, dan skor TRI kamu —
          siap di-print atau disimpan sebagai PDF langsung dari browser.
        </p>
      </header>

      <ResumeClient />
    </div>
  );
}

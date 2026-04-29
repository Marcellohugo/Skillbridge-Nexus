import { SessionPrep } from "@/components/shared/session-prep";

export default function SessionPrepPage() {
  return (
    <div className="stack stack-lg">
      <div>
        <h1 className="font-display font-bold text-3xl">Session Prep</h1>
        <p className="text-foreground-secondary mt-1">
          Brief otomatis menjelang sesi mentor — gap prioritas, open action items, dan pertanyaan siap tanya.
        </p>
      </div>
      <SessionPrep />
    </div>
  );
}

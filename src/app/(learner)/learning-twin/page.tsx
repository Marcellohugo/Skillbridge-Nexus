import { LearningTwin } from "@/components/shared/learning-twin";

export default function LearningTwinPage() {
  return (
    <div className="stack stack-lg">
      <div>
        <h1 className="font-display font-bold text-3xl">Learning Twin</h1>
        <p className="text-foreground-secondary mt-1">
          Peer dengan trajektori skill paling mirip denganmu — ideal buat study-buddy, pair project, atau validasi roadmap.
        </p>
      </div>
      <LearningTwin />
    </div>
  );
}

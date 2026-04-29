import { CapstoneGenerator } from "@/components/shared/capstone-generator";

export default function CapstonePage() {
  return (
    <div className="stack stack-lg">
      <div>
        <h1 className="font-display font-bold text-3xl">Capstone Project Generator</h1>
        <p className="text-foreground-secondary mt-1">
          3 proyek capstone yang dipersonalisasi — problem statement, tech stack, milestone, dan stretch goal yang peduli pada target role kamu.
        </p>
      </div>
      <CapstoneGenerator />
    </div>
  );
}

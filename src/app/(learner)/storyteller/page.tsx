import { CareerStoryteller } from "@/components/shared/career-storyteller";

export default function StorytellerPage() {
  return (
    <div className="stack stack-lg">
      <div>
        <h1 className="font-display font-bold text-3xl">Career Storyteller</h1>
        <p className="text-foreground-secondary mt-1">
          Narasi karier otomatis dari data kamu — 3 tone × 3 format siap copy-paste ke bio, LinkedIn, atau pitch.
        </p>
      </div>
      <CareerStoryteller />
    </div>
  );
}

// Maps assessment-bank skill labels to actual DB Skill names with weight.
// When bank skill contributes to multiple DB skills, weights must sum to ~1.0.
// Keep DB skill names IN SYNC with prisma/seed.ts.

export interface MappedSkill {
  name: string; // DB Skill.name
  weight: number; // 0-1
}

export const ASSESSMENT_SKILL_MAP: Record<string, MappedSkill[]> = {
  "React & Component Patterns": [{ name: "React.js", weight: 1.0 }],
  "TypeScript Advanced": [
    { name: "JavaScript", weight: 0.7 },
    { name: "React.js", weight: 0.3 },
  ],
  "Accessibility (WCAG)": [{ name: "HTML & CSS", weight: 1.0 }],
  "State Management (Zustand/RQ)": [{ name: "React.js", weight: 1.0 }],
  "Performance Optimization": [
    { name: "React.js", weight: 0.6 },
    { name: "JavaScript", weight: 0.4 },
  ],
  "Testing (Unit & E2E)": [
    { name: "Problem Solving", weight: 0.6 },
    { name: "Communication", weight: 0.4 },
  ],
  "Git Workflow Kolaboratif": [{ name: "Communication", weight: 1.0 }],
  "System Design Basics": [{ name: "Problem Solving", weight: 1.0 }],
};

export function resolveAssessmentSkill(label: string): MappedSkill[] {
  return ASSESSMENT_SKILL_MAP[label] ?? [];
}

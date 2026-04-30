export function computePortfolioEvidenceStrength(input: {
  description: string;
  projectUrl: string | null;
  skills: number;
  isValidated: boolean;
  completedAt: Date | null;
}): number {
  let score = 1;
  if (input.description.length > 80) score += 1;
  if (input.projectUrl) score += 2;
  score += Math.min(4, Math.floor(input.skills / 2) * 2);
  if (input.isValidated) score += 2;
  if (input.completedAt) score += 1;
  return Math.min(10, score);
}

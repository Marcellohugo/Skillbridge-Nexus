// Skill Gap Computation
export function calculateSkillGap(currentLevel: number, targetLevel: number): number {
  return Math.max(targetLevel - currentLevel, 0);
}

export function calculateWeightedGap(
  currentLevel: number,
  targetLevel: number,
  importance: number
): number {
  const gap = calculateSkillGap(currentLevel, targetLevel);
  return gap * importance;
}

// Career Fit Score
export function calculateCareerFitScore(
  matchedSkills: number,
  totalRequiredSkills: number,
  averageProficiency: number,
  targetProficiency: number = 80
): number {
  if (totalRequiredSkills === 0) return 0;
  const skillMatch = matchedSkills / totalRequiredSkills;
  const proficiencyRatio = Math.min(averageProficiency / targetProficiency, 1);
  return Math.round(skillMatch * proficiencyRatio * 100);
}

// Talent Readiness Index (TRI)
export interface TRIComponents {
  assessmentScore: number; // 0-100
  roleFitScore: number; // 0-100
  learningProgress: number; // 0-100
  mentoringContribution: number; // 0-100
  portfolioStrength: number; // 0-100
  consistencyStreak: number; // 0-100
}

export function calculateTRI(components: TRIComponents): number {
  const tri =
    components.assessmentScore * 0.2 +
    components.roleFitScore * 0.2 +
    components.learningProgress * 0.15 +
    components.mentoringContribution * 0.15 +
    components.portfolioStrength * 0.15 +
    components.consistencyStreak * 0.15;

  return Math.round(tri);
}

// TRI Milestone determination
export type TRIMilestone = "EMERGING" | "DEVELOPING" | "PROGRESSING" | "CAREER_READY" | "ADVANCED_READY";

export function getTRIMilestone(tri: number): TRIMilestone {
  if (tri < 35) return "EMERGING";
  if (tri < 50) return "DEVELOPING";
  if (tri < 70) return "PROGRESSING";
  if (tri < 85) return "CAREER_READY";
  return "ADVANCED_READY";
}

// Risk Detection
export interface RiskSignals {
  lastActivityDays: number;
  triProgressWeeks: number;
  missedMilestones: number;
  criticalGapsCount: number;
  confidenceScore: number;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function calculateRiskLevel(signals: RiskSignals): RiskLevel {
  let riskScore = 0;

  // No activity > 5 days
  if (signals.lastActivityDays > 5) riskScore += 2;
  if (signals.lastActivityDays > 10) riskScore += 2;

  // No TRI progress > 2 weeks
  if (signals.triProgressWeeks > 2) riskScore += 2;
  if (signals.triProgressWeeks > 4) riskScore += 2;

  // Repeated missed milestones
  riskScore += signals.missedMilestones;

  // Critical gaps not improving
  riskScore += signals.criticalGapsCount * 1.5;

  // Low confidence score
  if (signals.confidenceScore < 40) riskScore += 2;
  if (signals.confidenceScore < 30) riskScore += 2;

  if (riskScore >= 8) return "CRITICAL";
  if (riskScore >= 6) return "HIGH";
  if (riskScore >= 3) return "MEDIUM";
  return "LOW";
}

// Learning Path Utilities
export interface Milestone {
  name: string;
  targetTRI: number;
  estimatedWeeks: number;
  components: string[];
}

export function generateMilestones(): Milestone[] {
  return [
    {
      name: "Foundation Complete",
      targetTRI: 40,
      estimatedWeeks: 4,
      components: ["Complete 3 foundational modules", "Pass basic assessment"],
    },
    {
      name: "Core Skills Mastered",
      targetTRI: 60,
      estimatedWeeks: 8,
      components: ["Complete 8 modules", "Achieve 70% on skills test", "Start 2 mentor sessions"],
    },
    {
      name: "Career Ready",
      targetTRI: 75,
      estimatedWeeks: 12,
      components: ["Complete 12 modules", "Achieve 80% on specialization", "5+ mentor sessions", "2 portfolio projects"],
    },
    {
      name: "Advanced Ready",
      targetTRI: 90,
      estimatedWeeks: 16,
      components: ["Master all modules", "Achieve 90%+ on assessment", "Lead peer sessions", "5+ validated projects"],
    },
  ];
}

// Streak calculation
export function calculateStreak(activities: Date[]): number {
  if (activities.length === 0) return 0;

  const sorted = [...activities].sort((a, b) => b.getTime() - a.getTime());
  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const activity of sorted) {
    const actDate = new Date(activity);
    actDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((currentDate.getTime() - actDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (dayDiff > streak) {
      break;
    }
  }

  return streak;
}

// Learning pace recommendation
export function recommendLearningPace(hoursPerWeek: number): string {
  if (hoursPerWeek < 5) return "Light pace - 4 months to career ready";
  if (hoursPerWeek < 10) return "Moderate pace - 3 months to career ready";
  if (hoursPerWeek < 20) return "Intensive pace - 2 months to career ready";
  return "Accelerated pace - 6 weeks to career ready";
}

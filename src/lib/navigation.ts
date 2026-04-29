import type { TranslationKey } from "@/lib/i18n";

export interface NavItem {
  href: string;
  label: string;
  labelKey?: TranslationKey;
  icon?: string;
  primary?: boolean;
}

export type NavSectionKey = Extract<TranslationKey, "navGroup.learn" | "navGroup.career" | "navGroup.tools" | "navGroup.more">;

export type NavSection = {
  key: NavSectionKey;
  items: NavItem[];
};

const SECTION_ORDER: NavSectionKey[] = [
  "navGroup.learn",
  "navGroup.career",
  "navGroup.tools",
  "navGroup.more",
];

const LEARN_KEYS = new Set([
  "nav.assessment",
  "nav.skillGap",
  "nav.skillTree",
  "nav.skillSynergy",
  "nav.learningTwin",
  "nav.calibration",
  "nav.velocity",
  "nav.immunity",
  "nav.coach",
]);

const CAREER_KEYS = new Set([
  "nav.careerCompass",
  "nav.careerLadder",
  "nav.opportunities",
  "nav.marketValue",
  "nav.resume",
  "nav.storyteller",
  "nav.mockInterview",
]);

const TOOL_KEYS = new Set([
  "nav.capstone",
  "nav.sessionPrep",
  "nav.achievements",
]);

function sectionOf(item: NavItem): NavSectionKey {
  if (item.labelKey && LEARN_KEYS.has(item.labelKey)) return "navGroup.learn";
  if (item.labelKey && CAREER_KEYS.has(item.labelKey)) return "navGroup.career";
  if (item.labelKey && TOOL_KEYS.has(item.labelKey)) return "navGroup.tools";
  return "navGroup.more";
}

export function splitNavItems(items: NavItem[], maxPrimary = 5) {
  const primary = items.filter((item) => item.primary).slice(0, maxPrimary);
  const primaryHrefs = new Set(primary.map((item) => item.href));
  const secondary = items.filter((item) => !primaryHrefs.has(item.href));

  return { primary, secondary };
}

export function buildNavSections(items: NavItem[]): NavSection[] {
  const sections = new Map<NavSectionKey, NavItem[]>();

  for (const item of items) {
    const key = sectionOf(item);
    sections.set(key, [...(sections.get(key) ?? []), item]);
  }

  return SECTION_ORDER
    .map((key) => ({ key, items: sections.get(key) ?? [] }))
    .filter((section) => section.items.length > 0);
}

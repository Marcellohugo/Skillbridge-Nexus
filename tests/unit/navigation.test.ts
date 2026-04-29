import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildNavSections, splitNavItems, type NavItem } from "@/lib/navigation";

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", labelKey: "nav.dashboard", primary: true },
  { href: "/learning-path", label: "Learning Path", labelKey: "nav.learningPath", primary: true },
  { href: "/mentors", label: "Mentors", labelKey: "nav.mentors", primary: true },
  { href: "/portfolio", label: "Portfolio", labelKey: "nav.portfolio", primary: true },
  { href: "/assessment", label: "Assessment", labelKey: "nav.assessment" },
  { href: "/skill-tree", label: "Skill Tree", labelKey: "nav.skillTree" },
  { href: "/career-compass", label: "Career Compass", labelKey: "nav.careerCompass" },
  { href: "/resume", label: "Resume", labelKey: "nav.resume" },
];

describe("navigation helpers", () => {
  it("keeps primary navigation compact", () => {
    const split = splitNavItems(items, 3);

    assert.deepEqual(split.primary.map((item) => item.href), [
      "/dashboard",
      "/learning-path",
      "/mentors",
    ]);
    assert.equal(split.secondary.some((item) => item.href === "/portfolio"), true);
  });

  it("groups secondary navigation by user intent", () => {
    const sections = buildNavSections(items.filter((item) => !item.primary));

    assert.deepEqual(sections.map((section) => section.key), [
      "navGroup.learn",
      "navGroup.career",
    ]);
    assert.deepEqual(sections[0]?.items.map((item) => item.href), [
      "/assessment",
      "/skill-tree",
    ]);
    assert.deepEqual(sections[1]?.items.map((item) => item.href), [
      "/career-compass",
      "/resume",
    ]);
  });
});

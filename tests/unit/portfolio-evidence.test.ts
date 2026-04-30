import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computePortfolioEvidenceStrength } from "@/features/learner/portfolio-evidence";

describe("computePortfolioEvidenceStrength", () => {
  it("preserves existing skill evidence when an update does not change skill mappings", () => {
    const strength = computePortfolioEvidenceStrength({
      completedAt: new Date("2026-04-25T00:00:00.000Z"),
      description: "A detailed portfolio write-up that is intentionally longer than eighty characters.",
      isValidated: true,
      projectUrl: "https://example.com/project",
      skills: 4,
    });

    assert.equal(strength, 10);
  });
});

import test from "node:test";
import assert from "node:assert/strict";

import { isMentorAppRoute, isRouteSegment, matchesRoutePrefix } from "@/lib/route-guards";

test("isRouteSegment only matches exact route segment boundaries", () => {
  assert.equal(isRouteSegment("/mentor", "mentor"), true);
  assert.equal(isRouteSegment("/mentor/dashboard", "mentor"), true);
  assert.equal(isRouteSegment("/mentor/sessions/123", "mentor"), true);

  assert.equal(isRouteSegment("/mentors", "mentor"), false);
  assert.equal(isRouteSegment("/mentorship", "mentor"), false);
  assert.equal(isRouteSegment("/admin/mentor", "mentor"), false);
});

test("isMentorAppRoute does not capture learner mentor marketplace", () => {
  assert.equal(isMentorAppRoute("/mentor/dashboard"), true);
  assert.equal(isMentorAppRoute("/mentors"), false);
});

test("matchesRoutePrefix matches nested route prefixes without substring collisions", () => {
  const learnerPaths = ["/dashboard", "/mentors", "/skill-tree"] as const;

  assert.equal(matchesRoutePrefix("/skill-tree/react", learnerPaths), true);
  assert.equal(matchesRoutePrefix("/mentors", learnerPaths), true);
  assert.equal(matchesRoutePrefix("/mentor/dashboard", learnerPaths), false);
  assert.equal(matchesRoutePrefix("/dashboarding", learnerPaths), false);
});

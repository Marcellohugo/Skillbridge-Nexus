import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveSessionPayload, type JWTPayload } from "@/lib/auth";

const tokenPayload: JWTPayload = {
  email: "learner@example.com",
  role: "LEARNER",
  userId: "user-1",
};

describe("resolveSessionPayload", () => {
  it("rejects inactive users even when the JWT is otherwise valid", async () => {
    const session = await resolveSessionPayload(tokenPayload, async () => ({
      email: "learner@example.com",
      id: "user-1",
      isActive: false,
      role: "LEARNER",
    }));

    assert.equal(session, null);
  });

  it("uses the current database role and email instead of stale JWT claims", async () => {
    const session = await resolveSessionPayload(tokenPayload, async () => ({
      email: "new-email@example.com",
      id: "user-1",
      isActive: true,
      role: "MENTOR",
    }));

    assert.deepEqual(session, {
      email: "new-email@example.com",
      role: "MENTOR",
      userId: "user-1",
    });
  });
});

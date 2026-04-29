import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSecurityToken,
  expiresInMinutes,
  hashSecurityToken,
  isExpired,
} from "@/lib/security-tokens";

describe("security token helpers", () => {
  it("creates a raw token and stores only its hash", () => {
    const issued = createSecurityToken();

    assert.equal(typeof issued.token, "string");
    assert.equal(issued.token.length >= 32, true);
    assert.equal(issued.tokenHash, hashSecurityToken(issued.token));
    assert.notEqual(issued.tokenHash, issued.token);
  });

  it("calculates minute-based expiry from a provided clock", () => {
    const now = new Date("2026-04-25T00:00:00.000Z");

    assert.equal(expiresInMinutes(30, now).toISOString(), "2026-04-25T00:30:00.000Z");
  });

  it("treats equal or past expiry timestamps as expired", () => {
    const now = new Date("2026-04-25T00:00:00.000Z");

    assert.equal(isExpired(new Date("2026-04-24T23:59:59.999Z"), now), true);
    assert.equal(isExpired(now, now), true);
    assert.equal(isExpired(new Date("2026-04-25T00:00:00.001Z"), now), false);
  });
});

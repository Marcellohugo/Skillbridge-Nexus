import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hashAuditValue } from "@/lib/security-events";

describe("security event helpers", () => {
  it("hashes audit identifiers without exposing the original value", () => {
    const hashed = hashAuditValue("203.0.113.10");

    assert.ok(hashed);
    assert.equal(hashed.length, 64);
    assert.notEqual(hashed, "203.0.113.10");
    assert.equal(hashed, hashAuditValue("203.0.113.10"));
  });

  it("returns undefined for empty audit identifiers", () => {
    assert.equal(hashAuditValue(null), undefined);
    assert.equal(hashAuditValue("   "), undefined);
  });
});

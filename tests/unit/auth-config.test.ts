import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getJwtSecretValue } from "../../src/lib/auth-config";

describe("getJwtSecretValue", () => {
  it("rejects missing JWT_SECRET in production", () => {
    assert.throws(
      () => getJwtSecretValue({ NODE_ENV: "production" }),
      /JWT_SECRET/,
    );
  });

  it("uses a development fallback outside production", () => {
    assert.equal(
      getJwtSecretValue({ NODE_ENV: "development" }).length >= 32,
      true,
    );
  });

  it("accepts configured secrets with at least 32 characters", () => {
    const secret = "x".repeat(32);
    assert.equal(getJwtSecretValue({ NODE_ENV: "production", JWT_SECRET: secret }), secret);
  });
});

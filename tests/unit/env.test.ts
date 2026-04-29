import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("rejects production without DATABASE_URL", () => {
    assert.throws(
      () => parseEnv({ NODE_ENV: "production", JWT_SECRET: "x".repeat(32) }),
      /DATABASE_URL/,
    );
  });

  it("rejects production without JWT_SECRET", () => {
    assert.throws(
      () => parseEnv({ NODE_ENV: "production", DATABASE_URL: "postgresql://example" }),
      /JWT_SECRET/,
    );
  });

  it("accepts required production settings", () => {
    const parsed = parseEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://example",
      JWT_SECRET: "x".repeat(32),
    });

    assert.equal(parsed.NODE_ENV, "production");
    assert.equal(parsed.DATABASE_URL, "postgresql://example");
    assert.equal(parsed.JWT_SECRET, "x".repeat(32));
  });

  it("requires Resend credentials when Resend email delivery is selected", () => {
    assert.throws(
      () => parseEnv({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://example",
        JWT_SECRET: "x".repeat(32),
        EMAIL_PROVIDER: "resend",
      }),
      /RESEND_API_KEY/,
    );
  });

  it("requires both Upstash credentials when configured", () => {
    assert.throws(
      () => parseEnv({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://example",
        JWT_SECRET: "x".repeat(32),
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      }),
      /UPSTASH_REDIS_REST_TOKEN/,
    );
  });

  it("treats empty optional integration variables as unset", () => {
    const parsed = parseEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://example",
      JWT_SECRET: "x".repeat(32),
      APP_URL: "",
      EMAIL_FROM: "",
      RESEND_API_KEY: "",
      UPSTASH_REDIS_REST_TOKEN: "",
      UPSTASH_REDIS_REST_URL: "",
    });

    assert.equal(parsed.APP_URL, undefined);
    assert.equal(parsed.EMAIL_PROVIDER, "console");
    assert.equal(parsed.RESEND_API_KEY, undefined);
    assert.equal(parsed.UPSTASH_REDIS_REST_URL, undefined);
  });
});

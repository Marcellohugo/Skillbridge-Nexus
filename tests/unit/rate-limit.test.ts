import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createAsyncFixedWindowRateLimit,
  createFixedWindowRateLimit,
  createUpstashFixedWindowRateLimit,
} from "@/lib/rate-limit";

describe("createFixedWindowRateLimit", () => {
  it("blocks a key after the allowed attempts are used", () => {
    const limiter = createFixedWindowRateLimit({ maxAttempts: 3, windowMs: 60_000 });

    const first = limiter.check("ip:email", 1_000);
    const second = limiter.check("ip:email", 2_000);
    const third = limiter.check("ip:email", 3_000);
    const fourth = limiter.check("ip:email", 4_000);

    assert.equal(first.allowed, true);
    assert.equal(first.remaining, 2);
    assert.equal(second.allowed, true);
    assert.equal(second.remaining, 1);
    assert.equal(third.allowed, true);
    assert.equal(third.remaining, 0);
    assert.equal(fourth.allowed, false);
    assert.equal(fourth.remaining, 0);
    assert.equal(fourth.resetAt, 61_000);
  });

  it("starts a fresh window after the reset time", () => {
    const limiter = createFixedWindowRateLimit({ maxAttempts: 1, windowMs: 10_000 });

    assert.equal(limiter.check("key", 5_000).allowed, true);
    assert.equal(limiter.check("key", 6_000).allowed, false);

    const reset = limiter.check("key", 15_001);

    assert.equal(reset.allowed, true);
    assert.equal(reset.remaining, 0);
    assert.equal(reset.resetAt, 25_001);
  });

  it("tracks each key independently and supports manual reset", () => {
    const limiter = createFixedWindowRateLimit({ maxAttempts: 1, windowMs: 10_000 });

    assert.equal(limiter.check("a", 1_000).allowed, true);
    assert.equal(limiter.check("a", 2_000).allowed, false);
    assert.equal(limiter.check("b", 2_000).allowed, true);

    limiter.reset("a");

    assert.equal(limiter.check("a", 3_000).allowed, true);
  });

  it("wraps the in-memory limiter with an async interface", async () => {
    const limiter = createAsyncFixedWindowRateLimit({ maxAttempts: 1, windowMs: 10_000 });

    assert.equal((await limiter.check("key", 1_000)).allowed, true);
    assert.equal((await limiter.check("key", 2_000)).allowed, false);

    await limiter.reset("key");

    assert.equal((await limiter.check("key", 3_000)).allowed, true);
  });

  it("checks fixed-window counts through Upstash Redis REST pipeline", async () => {
    const requests: Array<{ url: string; body: unknown }> = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      requests.push({
        url: String(url),
        body: JSON.parse(String(init?.body)),
      });

      return Response.json([
        { result: 2 },
        { result: 1 },
        { result: 59_000 },
      ]);
    };

    const limiter = createUpstashFixedWindowRateLimit({
      fetchImpl,
      maxAttempts: 5,
      prefix: "test",
      token: "secret",
      url: "https://redis.example.com",
      windowMs: 60_000,
    });

    const result = await limiter.check("user@example.com", 1_000);

    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 3);
    assert.equal(result.resetAt, 60_000);
    assert.deepEqual(requests[0]?.body, [
      ["INCR", "test:user@example.com"],
      ["PEXPIRE", "test:user@example.com", 60_000, "NX"],
      ["PTTL", "test:user@example.com"],
    ]);
  });
});

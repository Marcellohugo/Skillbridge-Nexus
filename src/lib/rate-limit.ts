type RateLimitOptions = {
  maxAttempts: number;
  windowMs: number;
};

type UpstashRateLimitOptions = RateLimitOptions & {
  fetchImpl?: typeof fetch;
  prefix: string;
  token: string;
  url: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export type AsyncRateLimiter = {
  check(key: string, now?: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
};

export function createFixedWindowRateLimit({ maxAttempts, windowMs }: RateLimitOptions) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error("maxAttempts must be a positive integer.");
  }
  if (!Number.isInteger(windowMs) || windowMs < 1) {
    throw new Error("windowMs must be a positive integer.");
  }

  const entries = new Map<string, RateLimitEntry>();

  function pruneExpired(now: number) {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) {
        entries.delete(key);
      }
    }
  }

  return {
    check(key: string, now = Date.now()): RateLimitResult {
      pruneExpired(now);

      const current = entries.get(key);
      if (!current) {
        const resetAt = now + windowMs;
        entries.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: maxAttempts - 1, resetAt };
      }

      if (current.count >= maxAttempts) {
        return { allowed: false, remaining: 0, resetAt: current.resetAt };
      }

      current.count += 1;
      return {
        allowed: true,
        remaining: Math.max(maxAttempts - current.count, 0),
        resetAt: current.resetAt,
      };
    },
    reset(key: string) {
      entries.delete(key);
    },
    clear() {
      entries.clear();
    },
  };
}

export function createAsyncFixedWindowRateLimit(options: RateLimitOptions): AsyncRateLimiter {
  const limiter = createFixedWindowRateLimit(options);

  return {
    async check(key: string, now = Date.now()) {
      return limiter.check(key, now);
    },
    async reset(key: string) {
      limiter.reset(key);
    },
  };
}

function normalizeUpstashUrl(url: string) {
  return url.replace(/\/+$/, "");
}

async function readUpstashResult(response: Response) {
  if (!response.ok) {
    throw new Error(`Upstash rate limit request failed with ${response.status}.`);
  }

  return response.json() as Promise<Array<{ result: number }>>;
}

export function createUpstashFixedWindowRateLimit({
  fetchImpl = fetch,
  maxAttempts,
  prefix,
  token,
  url,
  windowMs,
}: UpstashRateLimitOptions): AsyncRateLimiter {
  const baseUrl = normalizeUpstashUrl(url);

  return {
    async check(key: string, now = Date.now()) {
      const redisKey = `${prefix}:${key}`;
      const response = await fetchImpl(`${baseUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["PEXPIRE", redisKey, windowMs, "NX"],
          ["PTTL", redisKey],
        ]),
      });
      const [countResponse, , ttlResponse] = await readUpstashResult(response);
      const count = Number(countResponse?.result ?? 0);
      const ttl = Number(ttlResponse?.result ?? windowMs);
      const resetAt = now + Math.max(ttl, 0);

      return {
        allowed: count <= maxAttempts,
        remaining: Math.max(maxAttempts - count, 0),
        resetAt,
      };
    },
    async reset(key: string) {
      const response = await fetchImpl(`${baseUrl}/del/${encodeURIComponent(`${prefix}:${key}`)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upstash rate limit reset failed with ${response.status}.`);
      }
    },
  };
}

function createRateLimiter(prefix: string, maxAttempts: number, windowMs: number): AsyncRateLimiter {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashFixedWindowRateLimit({
      maxAttempts,
      prefix,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      url: process.env.UPSTASH_REDIS_REST_URL,
      windowMs,
    });
  }

  return createAsyncFixedWindowRateLimit({
    maxAttempts,
    windowMs,
  });
}

export const loginRateLimit = createRateLimiter("login", 5, 10 * 60 * 1_000);

export const passwordResetRateLimit = createRateLimiter("password-reset", 3, 15 * 60 * 1_000);

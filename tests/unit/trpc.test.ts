import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { appRouter } from "@/server/api/root";

describe("tRPC router surface", () => {
  it("does not expose scaffold sign-in tokens", async () => {
    const caller = appRouter.createCaller({ session: null });
    const authCaller = caller.auth as unknown as Record<string, unknown>;

    await assert.rejects(
      () => (authCaller.signIn as (input: unknown) => Promise<unknown>)({
        email: "user@example.com",
        password: "password123",
      }),
      /No procedure found on path "auth,signIn"/,
    );
    assert.deepEqual(await caller.auth.session(), { user: null });
  });

  it("returns the current session user instead of hardcoded scaffold users", async () => {
    const caller = appRouter.createCaller({
      session: {
        email: "learner@example.com",
        role: "LEARNER",
        userId: "user-1",
      },
    });
    const userCaller = caller.user as unknown as Record<string, unknown>;

    await assert.rejects(
      () => (userCaller.list as () => Promise<unknown>)(),
      /No procedure found on path "user,list"/,
    );
    await assert.rejects(
      () => (userCaller.byId as (input: unknown) => Promise<unknown>)({ id: "u1" }),
      /No procedure found on path "user,byId"/,
    );
    assert.deepEqual(await caller.user.me(), {
      user: {
        email: "learner@example.com",
        role: "LEARNER",
        userId: "user-1",
      },
    });
  });
});

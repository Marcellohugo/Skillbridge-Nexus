import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import type { JWTPayload } from "@/lib/auth";

export type TRPCContext = {
  session: JWTPayload | null;
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

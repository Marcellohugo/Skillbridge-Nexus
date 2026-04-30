import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  session: publicProcedure.query(({ ctx }) => ({
    user: ctx.session
      ? {
          email: ctx.session.email,
          role: ctx.session.role,
          userId: ctx.session.userId,
        }
      : null,
  })),
});

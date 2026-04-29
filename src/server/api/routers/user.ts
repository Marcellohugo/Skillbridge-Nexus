import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const users = [
  { id: "u1", name: "Admin", email: "admin@kuchinkgaronk.local" },
  { id: "u2", name: "Marco", email: "marco@kuchinkgaronk.local" },
];

export const userRouter = createTRPCRouter({
  list: publicProcedure.query(() => users),
  byId: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(({ input }) => users.find((user) => user.id === input.id) ?? null),
});

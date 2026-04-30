import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { getSession } from "@/lib/auth";
import { appRouter } from "@/server/api/root";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => ({
      session: await getSession(),
    }),
  });

export { handler as GET, handler as POST };

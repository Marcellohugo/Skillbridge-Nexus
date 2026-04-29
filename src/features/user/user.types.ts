import { z } from "zod";

import { createUserSchema } from "./user.schema";

export type CreateUserInput = z.infer<typeof createUserSchema>;

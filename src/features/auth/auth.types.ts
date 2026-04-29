import { z } from "zod";

import { signInSchema } from "./auth.schema";

export type SignInInput = z.infer<typeof signInSchema>;

import { signInSchema } from "./auth.schema";
import type { SignInInput } from "./auth.types";

export function signIn(input: SignInInput) {
  const parsed = signInSchema.parse(input);

  return {
    userId: "u1",
    email: parsed.email,
  };
}

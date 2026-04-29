import { createUserSchema } from "./user.schema";
import type { CreateUserInput } from "./user.types";

export function createUser(input: CreateUserInput) {
  const parsed = createUserSchema.parse(input);

  return {
    id: crypto.randomUUID(),
    ...parsed,
  };
}

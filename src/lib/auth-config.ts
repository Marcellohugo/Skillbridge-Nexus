const DEV_JWT_SECRET = "skillbridge-nexus-development-secret-key";

type JwtEnv = Partial<Pick<NodeJS.ProcessEnv, "JWT_SECRET" | "NODE_ENV">>;

export function getJwtSecretValue(env: JwtEnv = process.env): string {
  const secret = env.JWT_SECRET?.trim();

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }

  return DEV_JWT_SECRET;
}

export function getJwtSecretKey(secret = getJwtSecretValue()): Uint8Array {
  return new TextEncoder().encode(secret);
}

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

test("app routes do not depend on static demo-data fixtures", () => {
  const offenders = walk(join(process.cwd(), "src", "app")).filter((file) => {
    const source = readFileSync(file, "utf8");
    return source.includes("@/lib/demo-data") || /\bDEMO_[A-Z0-9_]+\b/.test(source);
  });

  assert.deepEqual(offenders, []);
});

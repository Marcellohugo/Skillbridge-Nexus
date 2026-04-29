import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_LOCALE,
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  resolveLocale,
  translate,
} from "@/lib/i18n";

test("resolveLocale returns supported locales and falls back safely", () => {
  assert.equal(resolveLocale("id"), "id");
  assert.equal(resolveLocale("en"), "en");
  assert.equal(resolveLocale("de"), DEFAULT_LOCALE);
  assert.equal(resolveLocale(undefined), DEFAULT_LOCALE);
});

test("translate uses a typed dictionary with default locale fallback", () => {
  assert.equal(translate("id", "shell.logout"), "Keluar");
  assert.equal(translate("en", "shell.logout"), "Sign out");
  assert.equal(translate("en", "auth.login.submit"), "Sign in");
});

test("formatters use locale-aware date, number, currency, and relative time output", () => {
  const date = new Date(Date.UTC(2026, 4, 9, 8, 30));

  assert.equal(formatNumber(1_234_567, "id"), "1.234.567");
  assert.equal(formatNumber(1_234_567, "en"), "1,234,567");
  assert.match(formatCurrency(2_500_000, "id"), /^Rp/);
  assert.match(formatDate(date, "id", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), /Mei 2026/);
  assert.match(formatDate(date, "en", { month: "short", year: "numeric", timeZone: "UTC" }), /May 2026/);
  assert.equal(formatRelativeTime(-2, "day", "id"), "2 hari yang lalu");
  assert.equal(formatRelativeTime(3, "week", "en"), "in 3 weeks");
});

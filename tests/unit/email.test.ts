import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildEmailVerificationMessage,
  buildPasswordResetMessage,
  buildUrl,
} from "@/lib/email";

describe("transactional email helpers", () => {
  it("builds app-relative URLs from a configured base URL", () => {
    assert.equal(
      buildUrl("/reset-password?token=abc", "https://app.example.com/"),
      "https://app.example.com/reset-password?token=abc",
    );
  });

  it("creates password reset messages with the raw token link", () => {
    const message = buildPasswordResetMessage({
      appUrl: "https://app.example.com",
      email: "user@example.com",
      token: "raw-token",
    });

    assert.equal(message.to, "user@example.com");
    assert.match(message.text, /https:\/\/app\.example\.com\/reset-password\?token=raw-token/);
    assert.doesNotMatch(message.text, /tokenHash/);
  });

  it("creates email verification messages with the verification link", () => {
    const message = buildEmailVerificationMessage({
      appUrl: "https://app.example.com",
      email: "user@example.com",
      token: "raw-token",
    });

    assert.equal(message.to, "user@example.com");
    assert.match(message.html, /\/verify-email\?token=raw-token/);
  });
});

import assert from "node:assert/strict";
import test from "node:test";

process.env.AUTH_SECRET = "test-only-auth-secret-that-is-longer-than-32-characters";
process.env.PUBLIC_BASE_URL = "https://appistic.example.com";
import { hashPassword, isBcryptHash, verifyPassword } from "../src/lib/password";
import { entitlementsForPlan } from "../src/lib/entitlements";
import { isSafePublicUrl, isSameOriginRequest, canonicalPublicBaseUrl } from "../src/lib/request-security";
import { parseCardPatch } from "../src/lib/validation";
import { verifyPaddleSignature } from "../src/lib/paddle-signature";
import { escapeCsvCell } from "../src/lib/csv";
import { escapeVCard } from "../src/lib/vcard";
import { assertProductionConfig, missingProductionConfig } from "../src/lib/config";
import crypto from "node:crypto";

test("new passwords use bcrypt and verify", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.equal(isBcryptHash(hash), true);
  assert.equal((await verifyPassword("correct horse battery staple", hash)).valid, true);
  assert.equal((await verifyPassword("wrong", hash)).valid, false);
});

test("legacy password hash verifies and requests migration", async () => {
  const legacy = crypto.createHash("sha256").update(`appistic:${process.env.AUTH_SECRET}:legacy-password`).digest("hex");
  const result = await verifyPassword("legacy-password", legacy);
  assert.deepEqual(result, { valid: true, needsRehash: true });
});

test("entitlements are centralized and Free has two cards", () => {
  assert.deepEqual(entitlementsForPlan("free"), {
    plan: "free", cards: 2, leadCapPerMonth: 50, exportCsv: false, removeBranding: false, grandfathered: false,
  });
  assert.equal(entitlementsForPlan("pro").leadCapPerMonth, null);
  assert.equal(entitlementsForPlan("unknown").plan, "free");
});

test("unsafe URLs are rejected and canonical base is configured", () => {
  assert.equal(isSafePublicUrl("javascript:alert(1)"), false);
  assert.equal(isSafePublicUrl("data:text/html,hello"), false);
  assert.equal(isSafePublicUrl("https://example.com/path"), true);
  assert.equal(canonicalPublicBaseUrl(), "https://appistic.example.com");
});

test("authenticated mutation origin is same-origin only", () => {
  assert.equal(isSameOriginRequest(new Request("https://appistic.example.com/api/cards", { method: "POST", headers: { origin: "https://appistic.example.com" } })), true);
  assert.equal(isSameOriginRequest(new Request("https://appistic.example.com/api/cards", { method: "POST", headers: { origin: "https://evil.example" } })), false);
});

test("card patch rejects javascript links and accepts safe fields", () => {
  assert.equal(parseCardPatch({ links: [{ type: "link", label: "bad", url: "javascript:alert(1)" }] }).success, false);
  assert.equal(parseCardPatch({ published: true, links: [{ type: "link", label: "site", url: "https://example.com" }] }).success, true);
});

test("Paddle signatures cover the raw body and expire", () => {
  const raw = JSON.stringify({ event_id: "evt_1" });
  const ts = 1_700_000_000;
  const signature = crypto.createHmac("sha256", "secret").update(`${ts}:${raw}`).digest("hex");
  assert.equal(verifyPaddleSignature(raw, `ts=${ts};h1=${signature}`, "secret", ts), true);
  assert.equal(verifyPaddleSignature(raw + "x", `ts=${ts};h1=${signature}`, "secret", ts), false);
  assert.equal(verifyPaddleSignature(raw, `ts=${ts};h1=${signature}`, "secret", ts + 301), false);
});

test("CSV and vCard exports neutralize formula and CRLF injection", () => {
  assert.equal(escapeCsvCell("=HYPERLINK(\"https://evil\")"), "\"'=HYPERLINK(\"\"https://evil\"\")\"");
  assert.equal(escapeVCard("Name\r\nNOTE:Injected"), "Name\\nNOTE:Injected");
});

test("production configuration fails closed without secrets", () => {
  const missing = missingProductionConfig({ DATABASE_URL: "postgres://synthetic", AUTH_SECRET: "short", PUBLIC_BASE_URL: "http://example.test" });
  assert.deepEqual(missing, ["AUTH_SECRET"]);
  assert.throws(() => assertProductionConfig({ DATABASE_URL: "postgres://synthetic", AUTH_SECRET: "short", PUBLIC_BASE_URL: "http://example.test" }), /AUTH_SECRET/);
});

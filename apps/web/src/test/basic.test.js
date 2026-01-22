import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

test("deterministic hashing", () => {
  const h = createHash("sha256").update("abc").digest("hex");
  assert.equal(h.length, 64);
});

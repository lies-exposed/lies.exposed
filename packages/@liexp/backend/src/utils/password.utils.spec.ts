import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { describe, it, expect } from "vitest";
import { hash, verify } from "./password.utils.js";

describe("password.utils", () => {
  describe("hash", () => {
    it("should return a TaskEither that resolves to a non-empty string", async () => {
      const result = await pipe(hash("mypassword"), throwTE);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return a hash containing a colon separator", async () => {
      const result = await pipe(hash("mypassword"), throwTE);

      expect(result).toContain(":");
    });

    it("should produce a hash with a salt prefix and hex key", async () => {
      const result = await pipe(hash("mypassword"), throwTE);

      const [salt, key] = result.split(":");
      expect(salt).toHaveLength(32); // 16 bytes as hex = 32 chars
      expect(key).toHaveLength(128); // 64 bytes as hex = 128 chars
    });

    it("should produce different hashes for the same password (random salt)", async () => {
      const hash1 = await pipe(hash("samepassword"), throwTE);
      const hash2 = await pipe(hash("samepassword"), throwTE);

      expect(hash1).not.toBe(hash2);
    });

    it("should produce different hashes for different passwords", async () => {
      const hash1 = await pipe(hash("password1"), throwTE);
      const hash2 = await pipe(hash("password2"), throwTE);

      expect(hash1).not.toBe(hash2);
    });

    it("should return a Right TaskEither for a valid password", async () => {
      const either = await hash("validpassword")();

      expect(either._tag).toBe("Right");
    });

    it("should handle empty string password", async () => {
      const result = await pipe(hash(""), throwTE);

      expect(typeof result).toBe("string");
      expect(result).toContain(":");
    });
  });

  describe("verify", () => {
    it("should return true for a correct password", async () => {
      const password = "correctpassword";
      const hashed = await pipe(hash(password), throwTE);

      const result = await pipe(verify(password, hashed), throwTE);

      expect(result).toBe(true);
    });

    it("should return false for an incorrect password", async () => {
      const password = "correctpassword";
      const wrongPassword = "wrongpassword";
      const hashed = await pipe(hash(password), throwTE);

      const result = await pipe(verify(wrongPassword, hashed), throwTE);

      expect(result).toBe(false);
    });

    it("should return a Right TaskEither for a valid hash/password pair", async () => {
      const password = "testpassword";
      const hashed = await pipe(hash(password), throwTE);

      const either = await verify(password, hashed)();

      expect(either._tag).toBe("Right");
    });

    it("should return false when verifying with empty password against a hash", async () => {
      const password = "somepassword";
      const hashed = await pipe(hash(password), throwTE);

      const result = await pipe(verify("", hashed), throwTE);

      expect(result).toBe(false);
    });

    it("should return true for an empty password hashed and verified as empty", async () => {
      const password = "";
      const hashed = await pipe(hash(password), throwTE);

      const result = await pipe(verify(password, hashed), throwTE);

      expect(result).toBe(true);
    });

    it("should correctly verify multiple different passwords", async () => {
      const passwords = ["alpha", "beta", "gamma"];

      for (const pw of passwords) {
        const hashed = await pipe(hash(pw), throwTE);

        const correct = await pipe(verify(pw, hashed), throwTE);
        expect(correct).toBe(true);

        const incorrect = await pipe(verify("wrong", hashed), throwTE);
        expect(incorrect).toBe(false);
      }
    });

    it("should be consistent: verify is deterministic given the same salt", async () => {
      const password = "deterministic";
      const hashed = await pipe(hash(password), throwTE);

      const result1 = await pipe(verify(password, hashed), throwTE);
      const result2 = await pipe(verify(password, hashed), throwTE);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });
});

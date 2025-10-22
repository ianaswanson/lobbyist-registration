import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "mySecurePassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password); // Should be different from plain text
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for same password (different salts)", async () => {
      const password = "samePassword";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts = different hashes
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
    });

    it("should handle empty string", async () => {
      const hash = await hashPassword("");
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should handle special characters", async () => {
      const password = "P@ssw0rd!#$%^&*()";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it("should handle unicode characters", async () => {
      const password = "密码123🔒";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it("should handle very long passwords", async () => {
      const password = "a".repeat(200);
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "correctPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "correctPassword123";
      const wrongPassword = "wrongPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it("should reject password with different case", async () => {
      const password = "Password123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("password123", hash);

      expect(isValid).toBe(false);
    });

    it("should handle empty password verification", async () => {
      const hash = await hashPassword("");
      const isValid = await verifyPassword("", hash);

      expect(isValid).toBe(true);
    });

    it("should reject empty password against non-empty hash", async () => {
      const password = "myPassword";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("", hash);

      expect(isValid).toBe(false);
    });

    it("should verify password with special characters", async () => {
      const password = "P@ssw0rd!#$%";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should verify password with unicode characters", async () => {
      const password = "密码123🔒";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should handle invalid hash format", async () => {
      const password = "myPassword";
      const invalidHash = "not-a-valid-bcrypt-hash";
      const isValid = await verifyPassword(password, invalidHash);

      expect(isValid).toBe(false);
    });
  });

  describe("integration tests", () => {
    it("should complete full hash and verify workflow", async () => {
      const originalPassword = "userPassword2025";

      // Step 1: Hash the password
      const hash = await hashPassword(originalPassword);
      expect(hash).toBeDefined();

      // Step 2: Verify correct password
      const validCheck = await verifyPassword(originalPassword, hash);
      expect(validCheck).toBe(true);

      // Step 3: Verify incorrect password fails
      const invalidCheck = await verifyPassword("wrongPassword", hash);
      expect(invalidCheck).toBe(false);
    });

    it("should handle multiple users with same password", async () => {
      const commonPassword = "Password123";

      // Hash for user 1
      const hash1 = await hashPassword(commonPassword);

      // Hash for user 2
      const hash2 = await hashPassword(commonPassword);

      // Hashes should be different (different salts)
      expect(hash1).not.toBe(hash2);

      // Both should verify correctly
      expect(await verifyPassword(commonPassword, hash1)).toBe(true);
      expect(await verifyPassword(commonPassword, hash2)).toBe(true);
    });
  });
});

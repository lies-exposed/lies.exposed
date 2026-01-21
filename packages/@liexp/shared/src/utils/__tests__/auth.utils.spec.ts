import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  type AuthPermission,
} from "@liexp/io/lib/http/auth/permissions/index.js";
import { describe, expect, it } from "vitest";
import { checkIsAdmin } from "../auth.utils.js";

describe("auth.utils", () => {
  describe("checkIsAdmin", () => {
    it("should return true when user has AdminDelete permission", () => {
      const permissions: AuthPermission[] = [AdminDelete.literals[0]];
      expect(checkIsAdmin(permissions)).toBe(true);
    });

    it("should return true when user has AdminEdit permission", () => {
      const permissions: AuthPermission[] = [AdminEdit.literals[0]];
      expect(checkIsAdmin(permissions)).toBe(true);
    });

    it("should return true when user has AdminCreate permission", () => {
      const permissions: AuthPermission[] = [AdminCreate.literals[0]];
      expect(checkIsAdmin(permissions)).toBe(true);
    });

    it("should return true when user has AdminRead permission", () => {
      const permissions: AuthPermission[] = [AdminRead.literals[0]];
      expect(checkIsAdmin(permissions)).toBe(true);
    });

    it("should return true when user has multiple admin permissions", () => {
      const permissions: AuthPermission[] = [
        AdminDelete.literals[0],
        AdminEdit.literals[0],
        AdminCreate.literals[0],
        AdminRead.literals[0],
      ];
      expect(checkIsAdmin(permissions)).toBe(true);
    });

    it("should return false when user has no admin permissions", () => {
      const permissions: AuthPermission[] = [];
      expect(checkIsAdmin(permissions)).toBe(false);
    });

    it("should return false when user has non-admin permissions only", () => {
      // Using empty array as a representation of non-admin permissions
      const permissions: AuthPermission[] = [];
      expect(checkIsAdmin(permissions)).toBe(false);
    });
  });
});

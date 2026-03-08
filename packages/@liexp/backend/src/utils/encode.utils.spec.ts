import { describe, it, expect } from "vitest";
import { hash, GetEncodeUtils } from "./encode.utils.js";

describe("encode.utils", () => {
  describe("hash", () => {
    it("should return a hex string", () => {
      const result = hash({ name: "alice", role: "admin" });

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[0-9a-f]{40}$/);
    });

    it("should produce the same hash for the same input", () => {
      const obj = { key: "value", foo: "bar" };

      const first = hash(obj);
      const second = hash(obj);

      expect(first).toBe(second);
    });

    it("should produce different hashes for different inputs", () => {
      const a = hash({ name: "alice" });
      const b = hash({ name: "bob" });

      expect(a).not.toBe(b);
    });

    it("should only hash the specified fields", () => {
      const obj = { name: "alice", role: "admin", extra: "ignored" };

      const withExtra = hash(obj);
      const withoutExtra = hash(obj, ["name", "role"]);

      // withExtra hashes all keys including "extra", withoutExtra only "name" and "role"
      expect(withExtra).not.toBe(withoutExtra);
    });

    it("should hash only the specified fields subset", () => {
      const obj = { name: "alice", role: "admin" };

      const nameOnly = hash(obj, ["name"]);
      const roleOnly = hash(obj, ["role"]);

      expect(nameOnly).not.toBe(roleOnly);
    });

    it("should return a 40-character SHA-1 hex digest", () => {
      const result = hash({ id: "123" });

      expect(result).toHaveLength(40);
    });

    it("should produce consistent hash with default field selection", () => {
      const obj = { a: "1", b: "2" };
      const explicitDefault = hash(obj, Object.keys(obj));
      const implicit = hash(obj);

      expect(implicit).toBe(explicitDefault);
    });
  });

  describe("GetEncodeUtils", () => {
    it("should return an object with a hash method", () => {
      const utils = GetEncodeUtils<{ id: string }>((m) => ({ id: m.id }));

      expect(utils).toHaveProperty("hash");
      expect(typeof utils.hash).toBe("function");
    });

    it("should hash the model using the provided mapper", () => {
      interface User {
        id: string;
        name: string;
        password: string;
      }

      const utils = GetEncodeUtils<User>((m) => ({ id: m.id, name: m.name }));

      const user: User = { id: "u1", name: "alice", password: "secret" };
      const result = utils.hash(user);

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[0-9a-f]{40}$/);
    });

    it("should produce the same hash for equal mapped values", () => {
      interface Item {
        id: string;
        label: string;
      }

      const utils = GetEncodeUtils<Item>((m) => ({ id: m.id }));

      const a: Item = { id: "x", label: "foo" };
      const b: Item = { id: "x", label: "bar" };

      // Different label but same id — mapper only uses id
      expect(utils.hash(a)).toBe(utils.hash(b));
    });

    it("should produce different hashes for different mapped values", () => {
      interface Item {
        id: string;
      }

      const utils = GetEncodeUtils<Item>((m) => ({ id: m.id }));

      const a: Item = { id: "x" };
      const b: Item = { id: "y" };

      expect(utils.hash(a)).not.toBe(utils.hash(b));
    });

    it("should handle multiple mapped fields", () => {
      interface Event {
        type: string;
        date: string;
      }

      const utils = GetEncodeUtils<Event>((m) => ({
        type: m.type,
        date: m.date,
      }));

      const result = utils.hash({ type: "click", date: "2024-01-01" });

      expect(result).toHaveLength(40);
    });
  });
});

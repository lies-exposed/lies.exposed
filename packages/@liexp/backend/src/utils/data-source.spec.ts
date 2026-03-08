import { describe, expect, it } from "vitest";
import { ALL_ENTITIES, createORMConfig } from "./data-source.js";

describe("data-source", () => {
  describe("ALL_ENTITIES", () => {
    it("should export an array of entity classes", () => {
      expect(Array.isArray(ALL_ENTITIES)).toBe(true);
      expect(ALL_ENTITIES.length).toBeGreaterThan(0);
    });

    it("should contain well-known entity classes", () => {
      // Verify it has a reasonable number of entities
      expect(ALL_ENTITIES.length).toBeGreaterThanOrEqual(10);
    });

    it("should contain only functions (entity classes)", () => {
      for (const entity of ALL_ENTITIES) {
        expect(typeof entity).toBe("function");
      }
    });
  });

  describe("createORMConfig", () => {
    it("should merge base config with ALL_ENTITIES", () => {
      const config = createORMConfig({ type: "postgres" });
      expect(config.entities).toEqual(ALL_ENTITIES);
    });

    it("should set synchronize to false by default", () => {
      const config = createORMConfig({ type: "postgres" });
      expect(config.synchronize).toBe(false);
    });

    it("should allow overriding synchronize", () => {
      const config = createORMConfig({ type: "postgres" }, { synchronize: true });
      expect(config.synchronize).toBe(true);
    });

    it("should preserve base config options", () => {
      const config = createORMConfig({
        type: "postgres",
        host: "localhost",
        port: 5432,
        database: "testdb",
      } as any);
      expect((config as any).host).toBe("localhost");
      expect((config as any).port).toBe(5432);
      expect((config as any).database).toBe("testdb");
    });

    it("should allow overrides to take precedence over base config", () => {
      const config = createORMConfig(
        { type: "postgres", host: "original-host" } as any,
        { host: "override-host" } as any,
      );
      expect((config as any).host).toBe("override-host");
    });

    it("should include entities in the resulting config", () => {
      const config = createORMConfig({ type: "postgres" });
      expect(config.entities).toBeDefined();
      expect(Array.isArray(config.entities)).toBe(true);
      expect((config.entities as any[]).length).toBeGreaterThan(0);
    });

    it("should set the type from base config", () => {
      const config = createORMConfig({ type: "postgres" });
      expect(config.type).toBe("postgres");
    });
  });
});

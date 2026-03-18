import { describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { DataSource, EntityManager } from "typeorm";
import { toDBError, DBError } from "../orm/database.provider.js";

describe("database.provider", () => {
  describe("toDBError", () => {
    it("should convert Error to DBError with message and meta", () => {
      const error = new Error("Database connection failed");

      const result = toDBError()(error);

      expect(result).toBeInstanceOf(DBError);
      expect(result.name).toBe("DBError");
      expect(result.message).toBe("Database connection failed");
      expect(result.details.kind).toBe("ServerError");
    });

    it("should handle non-Error values by stringifying", () => {
      const unknownValue = { code: "ECONNREFUSED" };

      const result = toDBError()(unknownValue);

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle null value", () => {
      const result = toDBError()(null);

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle undefined value", () => {
      const result = toDBError()(undefined);

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should respect override status", () => {
      const error = new Error("Timeout");

      const result = toDBError({ status: 408 })(error);

      expect(result.details.status).toBe("408");
    });

    it("should use default status 500", () => {
      const error = new Error("Generic error");

      const result = toDBError()(error);

      expect(result.details.status).toBe("500");
    });
  });

  describe("DBError", () => {
    it("should have name DBError", () => {
      const error = new DBError("Test error", {
        kind: "ServerError",
        status: "500",
      });

      expect(error.name).toBe("DBError");
    });

    it("should have the correct message", () => {
      const error = new DBError("Connection refused", {
        kind: "ServerError",
        status: "500",
      });

      expect(error.message).toBe("Connection refused");
    });
  });
});

describe("GetDatabaseClient", () => {
  const mockLogger = {
    debug: { log: vi.fn() },
    error: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
  };

  const createMockDataSource = () => {
    const mockManager = mockDeep<EntityManager>();
    const mockConnection = {
      manager: mockManager as unknown as EntityManager,
    } as unknown as DataSource;

    return mockConnection;
  };

  it("should create a database client with manager", async () => {
    const mockDs = createMockDataSource();

    const { GetDatabaseClient } = await import("../orm/database.provider.js");

    const client = GetDatabaseClient({
      connection: mockDs,
      logger: mockLogger as any,
    });

    expect(client.manager).toBeDefined();
  });

  it("should format SQL queries correctly", async () => {
    const mockDs = createMockDataSource();

    const { GetDatabaseClient } = await import("../orm/database.provider.js");

    const client = GetDatabaseClient({
      connection: mockDs,
      logger: mockLogger as any,
    });

    expect(typeof client.formatQuery).toBe("function");
  });

  it("should return database client with required methods", async () => {
    const mockDs = createMockDataSource();

    const { GetDatabaseClient } = await import("../orm/database.provider.js");

    const client = GetDatabaseClient({
      connection: mockDs,
      logger: mockLogger as any,
    });

    expect(typeof client.findOne).toBe("function");
    expect(typeof client.find).toBe("function");
    expect(typeof client.save).toBe("function");
    expect(typeof client.close).toBe("function");
  });
});

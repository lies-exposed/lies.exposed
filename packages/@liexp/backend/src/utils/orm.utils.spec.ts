import { beforeEach, describe, expect, it, vi } from "vitest";
import { addOrder } from "./orm.utils.js";

const mockQ = {
  addOrderBy: vi.fn().mockReturnThis(),
} as any;

describe("orm.utils - addOrder", () => {
  beforeEach(() => {
    mockQ.addOrderBy.mockClear();
  });

  it("should add order by key with value", () => {
    addOrder({ name: "ASC" }, mockQ);
    expect(mockQ.addOrderBy).toHaveBeenCalledWith("name", "ASC");
  });

  it("should add order with prefix", () => {
    addOrder({ name: "DESC" }, mockQ, "user");
    expect(mockQ.addOrderBy).toHaveBeenCalledWith("user.name", "DESC");
  });

  it("should add order with orderedKeys", () => {
    addOrder({ a: "ASC", b: "DESC" }, mockQ, undefined, ["a", "b"]);
    expect(mockQ.addOrderBy).toHaveBeenCalledTimes(2);
  });

  it("should handle random order with seeder_random", () => {
    addOrder({ random: true } as Record<string, any>, mockQ);
    expect(mockQ.addOrderBy).toHaveBeenCalledWith("seeder_random", "DESC");
  });

  it("should handle multiple orders", () => {
    addOrder({ createdAt: "DESC", name: "ASC" }, mockQ);
    expect(mockQ.addOrderBy).toHaveBeenCalledTimes(2);
  });

  it("should handle prefix with random", () => {
    addOrder({ random: true } as Record<string, any>, mockQ, "test");
    expect(mockQ.addOrderBy).toHaveBeenCalledWith("seeder_random", "DESC");
  });

  it("should handle multiple random keys", () => {
    addOrder({ random: true, name: "ASC" } as Record<string, any>, mockQ);
    expect(mockQ.addOrderBy).toHaveBeenCalledTimes(2);
  });
});

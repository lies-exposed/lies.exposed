import { type ObjectLiteral, type SelectQueryBuilder } from "typeorm";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { addOrder } from "./orm.utils.js";

const mockQ = mockDeep<SelectQueryBuilder<ObjectLiteral>>();

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
    addOrder({ random: "DESC" }, mockQ);
    expect(mockQ.addOrderBy).toHaveBeenCalledWith("seeder_random", "DESC");
  });

  it("should handle multiple orders", () => {
    addOrder({ createdAt: "DESC", name: "ASC" }, mockQ);
    expect(mockQ.addOrderBy).toHaveBeenCalledTimes(2);
  });

  it("should handle prefix with random", () => {
    addOrder({ random: "DESC" }, mockQ, "test");
    expect(mockQ.addOrderBy).toHaveBeenCalledWith("seeder_random", "DESC");
  });

  it("should handle multiple random keys", () => {
    addOrder({ random: "DESC", name: "ASC" }, mockQ);
    expect(mockQ.addOrderBy).toHaveBeenCalledTimes(2);
  });
});

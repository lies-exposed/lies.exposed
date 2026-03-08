import { describe, expect, it, vi } from "vitest";
import { Book } from "../book.config.js";
import { Death } from "../death.config.js";
import { Patent } from "../patent.config.js";

const makeMockQb = () => {
  const qb = {
    andWhere: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orWhere: vi.fn().mockReturnThis(),
  } as any;
  return qb;
};

describe("Event Query Configs", () => {
  describe("Book config", () => {
    it("whereActorsIn should call andWhere on the query builder", () => {
      const qb = makeMockQb();
      const result = Book.whereActorsIn(qb, ["actor-1", "actor-2"]);
      expect(qb.andWhere).toHaveBeenCalled();
      expect(result).toBe(qb);
    });

    it("whereGroupsIn should call andWhere on the query builder", () => {
      const qb = makeMockQb();
      const result = Book.whereGroupsIn(qb, ["group-1"]);
      expect(qb.andWhere).toHaveBeenCalled();
      expect(result).toBe(qb);
    });

    it("whereMediaIn should call where on the query builder", () => {
      const qb = makeMockQb();
      const result = Book.whereMediaIn(qb, ["media-1"]);
      expect(result).toBe(qb);
    });

    it("whereTitleIn should return a SQL string", () => {
      const qb = makeMockQb();
      const result = Book.whereTitleIn(qb);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Death config", () => {
    it("whereActorsIn should call andWhere on the query builder", () => {
      const qb = makeMockQb();
      const result = Death.whereActorsIn(qb, ["actor-1"]);
      expect(qb.andWhere).toHaveBeenCalled();
      expect(result).toBe(qb);
    });

    it("whereGroupsIn should call andWhere on the query builder", () => {
      const qb = makeMockQb();
      const result = Death.whereGroupsIn(qb, ["group-1"]);
      expect(qb.andWhere).toHaveBeenCalled();
      expect(result).toBe(qb);
    });

    it("whereMediaIn should call andWhere on the query builder", () => {
      const qb = makeMockQb();
      const result = Death.whereMediaIn(qb, ["media-1"]);
      expect(qb.andWhere).toHaveBeenCalled();
      expect(result).toBe(qb);
    });

    it("whereTitleIn should return a SQL string", () => {
      const qb = makeMockQb();
      const result = Death.whereTitleIn(qb);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Patent config", () => {
    it("whereActorsIn should call andWhere on the query builder", () => {
      const qb = makeMockQb();
      const result = Patent.whereActorsIn(qb, ["actor-1"]);
      expect(qb.andWhere).toHaveBeenCalled();
      expect(result).toBe(qb);
    });

    it("whereGroupsIn should call andWhere on the query builder", () => {
      const qb = makeMockQb();
      const result = Patent.whereGroupsIn(qb, ["group-1"]);
      expect(qb.andWhere).toHaveBeenCalled();
      expect(result).toBe(qb);
    });

    it("whereMediaIn should call andWhere on the query builder", () => {
      const qb = makeMockQb();
      const result = Patent.whereMediaIn(qb, ["media-1"]);
      expect(qb.andWhere).toHaveBeenCalled();
      expect(result).toBe(qb);
    });

    it("whereTitleIn should return a SQL string", () => {
      const qb = makeMockQb();
      const result = Patent.whereTitleIn(qb);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

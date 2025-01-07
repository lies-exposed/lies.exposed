import {
  type SelectQueryBuilder,
  type DataSource,
  type EntityManager,
  type ObjectLiteral,
} from "typeorm";
import { vi } from "vitest";
import { mock, mockDeep } from "vitest-mock-extended";

const queryBuilder = mockDeep<SelectQueryBuilder<ObjectLiteral>>({
  where: vi.fn().mockReturnThis(),
  orWhere: vi.fn().mockReturnThis(),
  getOneOrFail: vi
    .fn()
    .mockRejectedValue(new Error("getOneOrFail not implemented")),
});

export const dbMock = {
  qb: queryBuilder,
  connection: mockDeep<DataSource>({
    manager: mock<EntityManager>({
      findOne: vi.fn().mockRejectedValue(new Error("findOne not implemented")),
      findAndCount: vi
        .fn()
        .mockRejectedValue(new Error("findAndCount not implemented")),
      count: vi.fn().mockRejectedValue(new Error("count not implemented")),
      find: vi.fn().mockRejectedValue(new Error("find not implemented")),
      findOneOrFail: vi
        .fn()
        .mockRejectedValue(new Error("findOneOrFail not implemented")),
      save: vi.fn().mockRejectedValue(new Error("save not implemented")),
      createQueryBuilder: vi.fn(() => queryBuilder),
    }),
  }),
};

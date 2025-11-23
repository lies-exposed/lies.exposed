import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import {
  type FilterQuery,
  type GetListQuery,
} from "@liexp/shared/lib/io/http/Query/index.js";
import * as O from "effect/Option";
import { Like } from "typeorm";
import { describe, test, expect } from "vitest";

describe("ORM utils V2", () => {
  test("Should return only pagination", () => {
    const query: GetListQuery = {
      _sort: O.none(),
      _end: O.none(),
      _start: O.none(),
      _order: O.none(),
      q: O.none(),
    };

    const ormOptions = getORMOptions(query, 20);
    expect(ormOptions).toEqual({ skip: 0, take: 20 });
  });

  test("Should return pagination and order with default sort", () => {
    const query: GetListQuery = {
      _sort: O.some("field"),
      _order: O.none(),
      _end: O.none(),
      _start: O.none(),
      q: O.none(),
    };

    const ormOptions = getORMOptions(query, 20);
    expect(ormOptions).toEqual({ skip: 0, take: 20, order: { field: "DESC" } });
  });

  test("Should return pagination and order with given sort", () => {
    const query: GetListQuery = {
      _sort: O.some("field"),
      _order: O.some("ASC"),
      _end: O.none(),
      _start: O.none(),
      q: O.none(),
    };

    const ormOptions = getORMOptions(query, 20);
    expect(ormOptions).toEqual({ skip: 0, take: 20, order: { field: "ASC" } });
  });

  test("Should return where with given filter", () => {
    const query: GetListQuery & FilterQuery = {
      _sort: O.none(),
      _order: O.none(),
      _end: O.none(),
      _start: O.none(),
      field: O.some("1"),
      q: O.none(),
    };

    const ormOptions = getORMOptions(query, 20);

    expect(ormOptions).toEqual({
      skip: 0,
      take: 20,
      where: { field: Like("%1%") },
    });
  });
});

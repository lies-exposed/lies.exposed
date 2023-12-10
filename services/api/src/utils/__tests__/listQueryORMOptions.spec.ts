import {
  type FilterQuery,
  type GetListQuery,
} from "@liexp/shared/lib/io/http/Query";
import * as O from "fp-ts/lib/Option.js";
import { Like } from "typeorm";
import { getORMOptions } from "../orm.utils.js";

describe("ORM utils V2", () => {
  test("Should return only pagination", () => {
    const query: GetListQuery = {
      _sort: O.none,
      _end: O.none,
      _start: O.none,
      _order: O.none,
    };

    const ormOptions = getORMOptions(query, 20);
    expect(ormOptions).toEqual({ skip: 0, take: 20 });
  });

  test("Should return pagination and order with default sort", () => {
    const query: GetListQuery = {
      _sort: O.some("field"),
      _order: O.none,
      _end: O.none,
      _start: O.none,
    };

    const ormOptions = getORMOptions(query, 20);
    expect(ormOptions).toEqual({ skip: 0, take: 20, order: { field: "DESC" } });
  });

  test("Should return pagination and order with given sort", () => {
    const query: GetListQuery = {
      _sort: O.some("field"),
      _order: O.some("ASC"),
      _end: O.none,
      _start: O.none,
    };

    const ormOptions = getORMOptions(query, 20);
    expect(ormOptions).toEqual({ skip: 0, take: 20, order: { field: "ASC" } });
  });

  test("Should return where with given filter", () => {
    const query: GetListQuery & FilterQuery = {
      _sort: O.none,
      _order: O.none,
      _end: O.none,
      _start: O.none,
      field: O.some("1"),
    };

    const ormOptions = getORMOptions(query, 20);

    expect(ormOptions).toEqual({
      skip: 0,
      take: 20,
      where: { field: Like("%1%") },
    });
  });
});

import * as t from "io-ts";
import { PaginationQuery } from "./PaginationQuery.js";
import { SortQuery } from "./SortQuery.js";

export const GetListQuery = t.type(
  {
    ...SortQuery.props,
    ...PaginationQuery.props,
  },
  "GetListQuery",
);

export type GetListQuery = t.TypeOf<typeof GetListQuery>;

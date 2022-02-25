import * as t from "io-ts";
import { PaginationQuery } from "./PaginationQuery";
import { SortQuery } from "./SortQuery";

export const GetListQuery = t.type(
  {
    ...SortQuery.props,
    ...PaginationQuery.props,
  },
  "GetListQuery"
);

export type GetListQuery = t.TypeOf<typeof GetListQuery>;

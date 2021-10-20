import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types";
import { UUID, Tag, BaseFrontmatter } from "./Common";
import { GetListQuery } from "./Query";

export const ListQuery = t.partial(
  {
    ...GetListQuery.props,
    ids: optionFromNullable(t.array(t.string)),
    events: optionFromNullable(t.array(t.string)),
    search: optionFromNullable(t.string),
  },
  "GetListKeywordQueryFilter"
);

export type ListQuery = t.TypeOf<typeof ListQuery>;

export const CreateKeyword = t.strict(
  {
    tag: Tag,
  },
  "CreateKeyword"
);
export type CreateKeyword = t.TypeOf<typeof CreateKeyword>;

export const Keyword = t.strict(
  {
    ...BaseFrontmatter.type.props,
    ...CreateKeyword.type.props,
    id: UUID,
  },
  "Keyword"
);
export type Keyword = t.TypeOf<typeof Keyword>;

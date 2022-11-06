import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { UUID, Tag, BaseProps } from "./Common";
import { Color } from "./Common/Color";
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
    color: t.union([Color, t.undefined]),
  },
  "CreateKeyword"
);
export type CreateKeyword = t.TypeOf<typeof CreateKeyword>;

export const Keyword = t.strict(
  {
    ...BaseProps.type.props,
    ...CreateKeyword.type.props,
    color: Color,
    id: UUID,
  },
  "Keyword"
);
export type Keyword = t.TypeOf<typeof Keyword>;

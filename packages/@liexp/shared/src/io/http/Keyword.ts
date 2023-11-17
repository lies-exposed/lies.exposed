import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { UUID, Tag, BaseProps } from "./Common";
import { Color } from "./Common/Color";
import { ListOutput, Output } from "./Common/Output";
import { GetListQuery } from "./Query";

export const KEYWORDS = t.literal("keywords");
export type KEYWORDS = t.TypeOf<typeof KEYWORDS>;

export const GetKeywordListQuery = t.type(
  {
    ...GetListQuery.props,
    ids: optionFromNullable(t.array(UUID)),
    events: optionFromNullable(t.array(UUID)),
    search: optionFromNullable(t.string),
  },
  "GetKeywordListQuery",
);

export type GetKeywordListQuery = t.TypeOf<typeof GetKeywordListQuery>;

export const CreateKeyword = t.strict(
  {
    tag: Tag,
    color: t.union([Color, t.undefined]),
  },
  "CreateKeyword",
);
export type CreateKeyword = t.TypeOf<typeof CreateKeyword>;

export const Keyword = t.strict(
  {
    ...BaseProps.type.props,
    ...CreateKeyword.type.props,
    color: Color,
    id: UUID,
    socialPosts: t.array(UUID)
  },
  "Keyword",
);
export type Keyword = t.TypeOf<typeof Keyword>;

export const SingleKeywordOutput = Output(Keyword, "Keyword");
export type SingleKeywordOutput = Output<Keyword>;
export const ListKeywordOutput = ListOutput(Keyword, "Keywords");
export type ListKeywordOutput = ListOutput<Keyword>;

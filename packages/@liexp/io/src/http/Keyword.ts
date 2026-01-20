import { Schema } from "effect";
import { Color } from "./Common/Color.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "./Common/Output.js";
import { UUID, Tag, BaseProps } from "./Common/index.js";
import { GetListQuery } from "./Query/index.js";

export const KEYWORDS = Schema.Literal("keywords");
export type KEYWORDS = typeof KEYWORDS.Type;

export const GetKeywordListQuery = Schema.Struct({
  ...GetListQuery.fields,
  ids: OptionFromNullishToNull(Schema.Array(UUID)),
  events: OptionFromNullishToNull(Schema.Array(UUID)),
}).annotations({ title: "GetKeywordListQuery" });

export type GetKeywordListQuery = typeof GetKeywordListQuery.Type;

export const CreateKeyword = Schema.Struct({
  tag: Tag,
  color: Schema.Union(Color, Schema.Undefined),
}).annotations({ title: "CreateKeyword" });
export type CreateKeyword = typeof CreateKeyword.Type;

export const Keyword = Schema.Struct({
  ...BaseProps.fields,
  ...CreateKeyword.fields,
  color: Color,
  id: UUID,
  socialPosts: Schema.Array(UUID),
}).annotations({ title: "Keyword" });
export type Keyword = typeof Keyword.Type;

export const SingleKeywordOutput = Output(Keyword).annotations({
  title: "Keyword",
});
export type SingleKeywordOutput = Output<Keyword>;
export const ListKeywordOutput = ListOutput(Keyword, "Keywords");
export type ListKeywordOutput = ListOutput<Keyword>;

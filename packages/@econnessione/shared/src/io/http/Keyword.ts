import * as t from "io-ts";
import { UUID, Tag, BaseFrontmatter } from "./Common";

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

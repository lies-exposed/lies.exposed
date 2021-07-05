import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { Color } from "./Common/Color";
import { markdownRemark } from "./Common/Markdown";

export const GetListActorQueryFilter = t.partial({
  ids: optionFromNullable(t.array(t.string)),
});

export type GetListActorQueryFilter = t.TypeOf<typeof GetListActorQueryFilter>;

export const ACTOR_FRONTMATTER = t.literal("ActorFrontmatter");
export const ActorFrontmatter = t.strict(
  {
    ...BaseFrontmatter.type.props,
    fullName: t.string,
    username: t.string,
    avatar: t.union([t.undefined, t.string]),
    color: Color,
  },
  ACTOR_FRONTMATTER.value
);

export type ActorFrontmatter = t.TypeOf<typeof ActorFrontmatter>;

export const Actor = t.strict(
  {
    ...ActorFrontmatter.type.props,
    avatar: t.union([t.undefined, t.string]),
    body: t.string,
  },
  "Actor"
);

export type Actor = t.TypeOf<typeof Actor>;

export const ActorMD = markdownRemark(ActorFrontmatter, "ActorMD");

export type ActorMD = t.TypeOf<typeof ActorMD>;

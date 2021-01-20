import * as t from "io-ts";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { Color } from "./Common/Color";
import { markdownRemark } from "./Common/Markdown";

export const TOPIC_FRONTMATTER = t.literal("TopicFrontmatter");
export const TopicFrontmatter = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: TOPIC_FRONTMATTER,
    label: t.string,
    slug: t.string,
    color: Color,
  },
  TOPIC_FRONTMATTER.value
);
export type TopicFrontmatter = t.TypeOf<typeof TopicFrontmatter>;

export const TopicMD = markdownRemark(TopicFrontmatter, "TopicMD");

export type TopicMD = t.TypeOf<typeof TopicMD>;

export const TopicData = t.intersection(
  [
    TopicFrontmatter,
    t.interface({
      selected: t.boolean,
    }),
  ],
  "TopicData"
);

export type TopicData = t.TypeOf<typeof TopicData>;

export const TopicPoint = t.interface(
  {
    x: t.number,
    y: t.number,
    data: TopicData,
  },
  "TopicPoint"
);

export type TopicPoint = t.TypeOf<typeof TopicPoint>;

import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps";
import { markdownRemark } from "./Common/Markdown";

const PAGE_FRONTMATTER = "PageFrontmatter";

export const PageFrontmatter = t.strict(
  {
    ...BaseProps.type.props,
    type: t.literal(PAGE_FRONTMATTER),
    title: t.string,
    path: t.string,
  },
  PAGE_FRONTMATTER
);

export type PageFrontmatter = t.TypeOf<typeof PageFrontmatter>;

export const Page = t.strict(
  {
    ...PageFrontmatter.type.props,
    body: t.string,
    body2: t.union([t.UnknownRecord, t.null]),
  },
  "Page"
);
export type Page = t.TypeOf<typeof Page>;

export const PageMD = markdownRemark(PageFrontmatter, "PageMD");

export type PageMD = t.TypeOf<typeof PageMD>;

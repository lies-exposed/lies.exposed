import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { Color } from "./Common/Color";
import { JSONFromString } from "./Common/JSONFromString";
import { markdownRemark } from "./Common/Markdown";
import { Polygon } from "./Common/Polygon";
import { ImageSource } from "./Image";

export const PROJECT_FRONTMATTER = t.literal("ProjectFrontmatter");
export type PROJECT_FRONTMATTER = t.TypeOf<typeof PROJECT_FRONTMATTER>;

export const Project = t.strict(
  {
    ...BaseFrontmatter.type.props,
    name: t.string,
    color: Color,
    areas: nonEmptyArray(JSONFromString.pipe(Polygon)),
    images: t.array(ImageSource),
    startDate: DateFromISOString,
    endDate: t.union([DateFromISOString, t.undefined]),
    body: t.string
  },
  "ProjectFrontmatter"
);

export type Project = t.TypeOf<typeof Project>;

export const ProjectMD = markdownRemark(Project, "ProjectMD");
export type ProjectMD = t.TypeOf<typeof ProjectMD>;

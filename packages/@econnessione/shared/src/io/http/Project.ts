import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
// import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { Area } from "./Area";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { Color } from "./Common/Color";
import { markdownRemark } from "./Common/Markdown";
import { ProjectImage } from "./ProjectImage";

export const PROJECT_FRONTMATTER = t.literal("ProjectFrontmatter");
export type PROJECT_FRONTMATTER = t.TypeOf<typeof PROJECT_FRONTMATTER>;

export const Project = t.strict(
  {
    ...BaseFrontmatter.type.props,
    name: t.string,
    color: Color,
    areas: t.array(Area),
    images: t.array(ProjectImage),
    startDate: DateFromISOString,
    endDate: t.union([DateFromISOString, t.undefined]),
    body: t.string,
  },
  "Project"
);

export type Project = t.TypeOf<typeof Project>;

export const ProjectMD = markdownRemark(Project, "ProjectMD");
export type ProjectMD = t.TypeOf<typeof ProjectMD>;

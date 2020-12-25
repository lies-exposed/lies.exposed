import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { BaseFrontmatter } from "./Common/BaseFrontmatter"
import { Color } from "./Common/Color"
import { JSONFromString } from "./Common/JSONFromString"
import { markdownRemark } from "./Common/Markdown"
import { Polygon } from "./Common/Polygon"
import { ImageSource } from "./Image"

export const PROJECT_FRONTMATTER = t.literal('ProjectFrontmatter')
export type PROJECT_FRONTMATTER = t.TypeOf<typeof PROJECT_FRONTMATTER>

export const ProjectFrontmatter = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: PROJECT_FRONTMATTER,
    name: t.string,
    color: Color,
    areas: optionFromNullable(nonEmptyArray(JSONFromString.pipe(Polygon))),
    images: optionFromNullable(t.array(ImageSource)),
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
  },
  "ProjectFrontmatter"
)

export type ProjectFrontmatter = t.TypeOf<typeof ProjectFrontmatter>

export const ProjectMD = markdownRemark(ProjectFrontmatter, "ProjectMD")
export type ProjectMD = t.TypeOf<typeof ProjectMD>

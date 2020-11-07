import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Color } from "./Common/Color"
import { JSONFromString } from "./Common/JSONFromString"
import { Polygon } from "./Common/Polygon"
import { BaseFrontmatter } from "./Frontmatter"
import { ImageSource } from "./Image"
import { markdownRemark } from "./Markdown"

export const ProjectFrontmatter = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: t.literal('ProjectFrontmatter'),
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

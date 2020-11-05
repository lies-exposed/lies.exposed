import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Color } from "./Common/Color"
import { Polygon } from "./Common/Polygon"
import { ImageSource } from "./Image"
import { JSONFromString } from "./JSONFromString"
import { markdownRemark } from "./Markdown"

export const ProjectFrontmatter = t.strict(
  {
    uuid: t.string,
    name: t.string,
    color: Color,
    areas: optionFromNullable(nonEmptyArray(JSONFromString.pipe(Polygon))),
    images: optionFromNullable(t.array(ImageSource)),
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString
  },
  "ProjectFrontmatter"
)

export type ProjectFrontmatter = t.TypeOf<typeof ProjectFrontmatter>

export const ProjectMD = markdownRemark(ProjectFrontmatter, "ProjectMD")
export type ProjectMD = t.TypeOf<typeof ProjectMD>

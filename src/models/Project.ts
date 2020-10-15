import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Color } from "./Common/Color"
import { Polygon } from "./Common/Polygon"
import { ImageAndDescription } from "./Image"
import { JSONFromString } from "./JSONFromString"
import { mdx } from "./Mdx"

export const ProjectFrontmatter = t.strict(
  {
    uuid: t.string,
    name: t.string,
    color: Color,
    areas: t.array(JSONFromString.pipe(Polygon)),
    images: t.array(ImageAndDescription),
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    date: DateFromISOString,
  },
  "ProjectFrontmatter"
)

export type ProjectFrontmatter = t.TypeOf<typeof ProjectFrontmatter>

export const ProjectMD = mdx(ProjectFrontmatter, 'ProjectMD')
export type ProjectMD = t.TypeOf<typeof ProjectMD>
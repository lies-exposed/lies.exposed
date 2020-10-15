import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Polygon } from "./Common/Polygon"
import { ImageFileNode } from "./Image"
import { JSONFromString } from "./JSONFromString"

export const ProjectFrontmatter = t.strict(
  {
    uuid: t.string,
    name: t.string,
    areas: t.array(JSONFromString.pipe(Polygon)),
    images: t.array(ImageFileNode),
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    date: DateFromISOString,
  },
  "ProjectFrontmatter"
)

export type ProjectFrontmatter = t.TypeOf<typeof ProjectFrontmatter>

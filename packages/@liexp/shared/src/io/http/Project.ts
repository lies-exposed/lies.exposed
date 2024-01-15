import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
// import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { Area } from "./Area.js";
import { BaseProps } from "./Common/BaseProps.js";
import { Color } from "./Common/Color.js";
import { Media } from "./Media.js";

export const PROJECT_FRONTMATTER = t.literal("ProjectFrontmatter");
export type PROJECT_FRONTMATTER = t.TypeOf<typeof PROJECT_FRONTMATTER>;

export const Project = t.strict(
  {
    ...BaseProps.type.props,
    name: t.string,
    color: Color,
    areas: t.array(Area),
    media: t.array(Media),
    startDate: DateFromISOString,
    endDate: t.union([DateFromISOString, t.undefined]),
    body: t.string,
  },
  "Project",
);

export type Project = t.TypeOf<typeof Project>;
